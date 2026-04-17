import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AttendanceStatus,
  RegistrationStatus,
  StudentType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getByUserId(userId: string) {
    const student = await this.prisma.student.findFirst({
      where: { userId, deletedAt: null },
      include: { user: { select: { id: true, username: true, email: true, role: true } } },
    });
    if (!student) throw new NotFoundException('Student profile not found');
    return student;
  }

  async summarizeHours(studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, deletedAt: null },
    });
    if (!student) throw new NotFoundException('Student not found');

    const approvedRegs = await this.prisma.registration.findMany({
      where: {
        studentId,
        deletedAt: null,
        status: RegistrationStatus.CONFIRMED,
        attendances: {
          some: { status: AttendanceStatus.APPROVED, deletedAt: null },
        },
      },
      include: {
        activity: true,
        attendances: { where: { status: AttendanceStatus.APPROVED } },
      },
    });

    const activityHours = approvedRegs.reduce(
      (sum, r) => sum + (r.activity?.hours ?? 0),
      0,
    );
    const activityCount = new Set(approvedRegs.map((r) => r.activityId)).size;

    const transfers = await this.prisma.creditTransfer.findMany({
      where: { studentId, deletedAt: null },
    });
    const transferHours = transfers.reduce((s, t) => s + t.hoursGranted, 0);

    const special = await this.prisma.specialHourRequest.findMany({
      where: { studentId, status: 'APPROVED' },
    });
    const specialHours = special.reduce(
      (s, r) => s + (r.decidedHours ?? r.hoursAsked),
      0,
    );

    const totalHours = activityHours + transferHours + specialHours;
    const targetHours = student.studentType === StudentType.REGULAR ? 100 : 50;
    const minActivities = student.studentType === StudentType.REGULAR ? 25 : 4;

    return {
      studentId,
      studentType: student.studentType,
      approvedActivityCount: activityCount,
      minActivitiesRequired: minActivities,
      activityHours,
      creditTransferHours: transferHours,
      specialHours,
      totalHours,
      targetHours,
      meetsHourTarget: totalHours >= targetHours,
      meetsActivityCount: activityCount >= minActivities,
      evaluationReady:
        totalHours >= targetHours && activityCount >= minActivities,
    };
  }

  async transcript(userId: string) {
    const profile = await this.getByUserId(userId);
    const summary = await this.summarizeHours(profile.id);

    const rows = await this.prisma.registration.findMany({
      where: { studentId: profile.id, deletedAt: null },
      include: {
        activity: true,
        attendances: true,
      },
      orderBy: { registeredAt: 'desc' },
    });

    return { profile, summary, registrations: rows };
  }
}
