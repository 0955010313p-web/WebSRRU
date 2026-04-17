import { Injectable } from '@nestjs/common';
import { Prisma, ActivityCategory, ActivityLevel, StudentType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnhancedAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalStudents,
      totalActivities,
      totalRegistrations,
      totalAttendances,
      monthlyStats,
      facultyStats,
      categoryStats
    ] = await Promise.all([
      this.prisma.student.count({ where: { deletedAt: null } }),
      this.prisma.activity.count({ where: { deletedAt: null } }),
      this.prisma.registration.count({ where: { deletedAt: null } }),
      this.prisma.attendance.count({ where: { deletedAt: null } }),
      this.getMonthlyStats(startOfMonth),
      this.getFacultyStats(),
      this.getCategoryStats()
    ]);

    return {
      overview: {
        totalStudents,
        totalActivities,
        totalRegistrations,
        totalAttendances,
        averageActivitiesPerStudent: totalStudents > 0 ? totalRegistrations / totalStudents : 0
      },
      monthlyStats,
      facultyStats,
      categoryStats
    };
  }

  async getParticipationStats(filters?: {
    faculty?: string;
    yearLevel?: number;
    studentType?: StudentType;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: Prisma.RegistrationWhereInput = {
      deletedAt: null,
      student: {
        ...(filters?.faculty && { faculty: filters.faculty }),
        ...(filters?.yearLevel && { yearLevel: filters.yearLevel }),
        ...(filters?.studentType && { studentType: filters.studentType })
      },
      activity: {
        ...(filters?.startDate && { startTime: { gte: filters.startDate } }),
        ...(filters?.endDate && { endTime: { lte: filters.endDate } })
      }
    };

    const registrations = await this.prisma.registration.findMany({
      where,
      include: {
        student: true,
        activity: true,
        attendances: {
          where: { status: 'APPROVED' }
        }
      }
    });

    const totalHours = registrations.reduce((sum, reg) => {
      const approvedHours = reg.attendances.length * reg.activity.hours;
      return sum + approvedHours;
    }, 0);

    const uniqueStudents = new Set(registrations.map(reg => reg.studentId)).size;

    return {
      totalRegistrations: registrations.length,
      uniqueStudents,
      totalHours,
      averageHoursPerStudent: uniqueStudents > 0 ? totalHours / uniqueStudents : 0,
      participationRate: uniqueStudents / await this.getTotalStudentsCount(filters) * 100
    };
  }

  async getFacultyPerformance() {
    const faculties = await this.prisma.student.groupBy({
      by: ['faculty'],
      _count: { id: true },
      where: { deletedAt: null }
    });

    const facultyStats = await Promise.all(
      faculties.map(async (faculty) => {
        const students = await this.prisma.student.findMany({
          where: { faculty: faculty.faculty, deletedAt: null },
          include: {
            registrations: {
              include: {
                attendances: {
                  where: { status: 'APPROVED' }
                },
                activity: true
              }
            }
          }
        });

        const totalHours = students.reduce((sum, student) => {
          const studentHours = student.registrations.reduce((hourSum, reg) => {
            return hourSum + (reg.attendances.length * reg.activity.hours);
          }, 0);
          return sum + studentHours;
        }, 0);

        const eligibleStudents = students.filter(student => {
          const studentHours = student.registrations.reduce((hourSum, reg) => {
            return hourSum + (reg.attendances.length * reg.activity.hours);
          }, 0);
          const studentActivities = student.registrations.filter(reg => 
            reg.attendances.some(att => att.status === 'APPROVED')
          ).length;
          
          const requirements = student.studentType === StudentType.REGULAR
            ? { minHours: 100, minActivities: 25 }
            : { minHours: 50, minActivities: 4 };
          
          return studentHours >= requirements.minHours && studentActivities >= requirements.minActivities;
        }).length;

        return {
          faculty: faculty.faculty,
          totalStudents: faculty._count.id,
          eligibleStudents,
          totalHours,
          eligibilityRate: (eligibleStudents / faculty._count.id) * 100,
          averageHoursPerStudent: totalHours / faculty._count.id
        };
      })
    );

    return facultyStats.sort((a, b) => b.eligibilityRate - a.eligibilityRate);
  }

  async getActivityTrends(months: number = 12) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const activities = await this.prisma.activity.findMany({
      where: {
        startTime: { gte: startDate, lte: endDate },
        deletedAt: null
      },
      include: {
        registrations: {
          include: {
            attendances: {
              where: { status: 'APPROVED' }
            }
          }
        }
      }
    });

    const monthlyData = activities.reduce((acc, activity) => {
      const monthKey = activity.startTime.toISOString().slice(0, 7); // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          totalActivities: 0,
          totalRegistrations: 0,
          totalAttendances: 0,
          totalHours: 0
        };
      }

      acc[monthKey].totalActivities++;
      acc[monthKey].totalRegistrations += activity.registrations.length;
      acc[monthKey].totalAttendances += activity.registrations.reduce((sum, reg) => 
        sum + reg.attendances.length, 0);
      acc[monthKey].totalHours += activity.registrations.reduce((sum, reg) => 
        sum + (reg.attendances.length * activity.hours), 0);

      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }

  async getStudentProgressReport(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        registrations: {
          include: {
            activity: true,
            attendances: {
              where: { status: 'APPROVED' }
            }
          }
        },
        creditTransfers: true
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const totalActivityHours = student.registrations.reduce((sum, reg) => {
      return sum + (reg.attendances.length * reg.activity.hours);
    }, 0);

    const creditHours = student.creditTransfers.reduce((sum, ct) => sum + ct.hoursGranted, 0);
    const totalHours = totalActivityHours + creditHours;
    const totalActivities = student.registrations.filter(reg => 
      reg.attendances.some(att => att.status === 'APPROVED')
    ).length;

    const requirements = student.studentType === StudentType.REGULAR
      ? { minHours: 100, minActivities: 25 }
      : { minHours: 50, minActivities: 4 };

    const categoryBreakdown = student.registrations.reduce((acc, reg) => {
      if (reg.attendances.some(att => att.status === 'APPROVED')) {
        const category = reg.activity.category;
        if (!acc[category]) acc[category] = { activities: 0, hours: 0 };
        acc[category].activities++;
        acc[category].hours += reg.activity.hours;
      }
      return acc;
    }, {} as Record<ActivityCategory, { activities: number; hours: number }>);

    return {
      student: {
        id: student.id,
        studentCode: student.studentCode,
        name: `${student.firstName} ${student.lastName}`,
        faculty: student.faculty,
        major: student.major,
        yearLevel: student.yearLevel,
        studentType: student.studentType
      },
      progress: {
        totalHours,
        totalActivities,
        creditHours,
        requirements,
        hoursProgress: Math.min((totalHours / requirements.minHours) * 100, 100),
        activitiesProgress: Math.min((totalActivities / requirements.minActivities) * 100, 100),
        isEligible: totalHours >= requirements.minHours && totalActivities >= requirements.minActivities
      },
      breakdown: {
        categories: categoryBreakdown,
        recentActivities: student.registrations
          .filter(reg => reg.attendances.some(att => att.status === 'APPROVED'))
          .sort((a, b) => b.activity.startTime.getTime() - a.activity.startTime.getTime())
          .slice(0, 10)
          .map(reg => ({
            title: reg.activity.title,
            category: reg.activity.category,
            hours: reg.activity.hours,
            date: reg.activity.startTime,
            status: reg.attendances[0]?.status || 'PENDING_APPROVAL'
          }))
      }
    };
  }

  private async getMonthlyStats(startDate: Date) {
    const registrations = await this.prisma.registration.findMany({
      where: {
        registeredAt: { gte: startDate },
        deletedAt: null
      },
      include: {
        activity: true
      }
    });

    return {
      newRegistrations: registrations.length,
      uniqueStudents: new Set(registrations.map(reg => reg.studentId)).size,
      totalHours: registrations.reduce((sum, reg) => sum + reg.activity.hours, 0)
    };
  }

  private async getFacultyStats() {
    return this.prisma.student.groupBy({
      by: ['faculty'],
      _count: { id: true },
      where: { deletedAt: null },
      orderBy: { _count: { id: 'desc' } }
    });
  }

  private async getCategoryStats() {
    const activities = await this.prisma.activity.groupBy({
      by: ['category'],
      _count: { id: true },
      where: { deletedAt: null },
      orderBy: { _count: { id: 'desc' } }
    });

    return activities.map(stat => ({
      category: stat.category,
      count: stat._count.id
    }));
  }

  private async getTotalStudentsCount(filters?: any) {
    return this.prisma.student.count({
      where: {
        deletedAt: null,
        ...(filters?.faculty && { faculty: filters.faculty }),
        ...(filters?.yearLevel && { yearLevel: filters.yearLevel }),
        ...(filters?.studentType && { studentType: filters.studentType })
      }
    });
  }
}
