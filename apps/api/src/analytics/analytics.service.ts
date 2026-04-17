import { Injectable } from '@nestjs/common';
import { ActivityStatus, AttendanceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [
      students,
      activities,
      registrations,
      pendingAttendance,
      pendingSpecial,
      pendingAmendments,
    ] = await Promise.all([
      this.prisma.student.count({ where: { deletedAt: null } }),
      this.prisma.activity.count({
        where: { deletedAt: null, status: ActivityStatus.PUBLISHED },
      }),
      this.prisma.registration.count({ where: { deletedAt: null } }),
      this.prisma.attendance.count({
        where: { status: AttendanceStatus.PENDING_APPROVAL, deletedAt: null },
      }),
      this.prisma.specialHourRequest.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.amendmentRequest.count({
        where: { status: 'PENDING' },
      }),
    ]);
    return {
      students,
      publishedActivities: activities,
      registrations,
      pendingAttendanceApprovals: pendingAttendance,
      pendingSpecialHourRequests: pendingSpecial,
      pendingAmendmentRequests: pendingAmendments,
    };
  }
}
