import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AttendanceStatus,
  RegistrationStatus,
  Role,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CheckInDto } from './dto/check-in.dto';

@Injectable()
export class AttendancesService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIn(userId: string, dto: CheckInDto) {
    const student = await this.prisma.student.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!student) throw new NotFoundException('Student profile required');

    const activity = await this.prisma.activity.findFirst({
      where: { id: dto.activityId, deletedAt: null },
    });
    if (!activity) throw new NotFoundException('Activity not found');
    if (activity.qrSecret !== dto.qrSecret) {
      throw new BadRequestException('Invalid QR token');
    }
    const now = new Date();
    if (now < activity.startTime || now > activity.endTime) {
      throw new BadRequestException('Outside check-in window');
    }

    const reg = await this.prisma.registration.findFirst({
      where: {
        studentId: student.id,
        activityId: dto.activityId,
        status: RegistrationStatus.CONFIRMED,
        deletedAt: null,
      },
    });
    if (!reg) throw new BadRequestException('Not registered for this activity');

    const existing = await this.prisma.attendance.findFirst({
      where: { registrationId: reg.id, deletedAt: null },
    });
    if (existing) throw new BadRequestException('Already checked in');

    // Server-side validation for proof image path to avoid storing arbitrary URLs/paths.
    if (dto.proofImagePath) {
      const p = dto.proofImagePath;
      if (p.includes('..') || p.length > 400) {
        throw new BadRequestException('Invalid proof image path');
      }
      // Accept keys like "uploads/..." or "/uploads/..." or full S3 key "uploads/..."
      if (!p.startsWith('uploads/') && !p.startsWith('/uploads/')) {
        throw new BadRequestException('Invalid proof image key');
      }
    }

    return this.prisma.attendance.create({
      data: {
        registrationId: reg.id,
        checkInTime: now,
        proofImagePath: dto.proofImagePath,
        status: AttendanceStatus.PENDING_APPROVAL,
      },
    });
  }

  async review(
    attendanceId: string,
    status: 'APPROVED' | 'REJECTED',
    requester: { sub: string; role: Role },
  ) {
    const staff: Role[] = [Role.ADMIN, Role.COORDINATOR];
    if (!staff.includes(requester.role)) {
      throw new ForbiddenException();
    }
    const row = await this.prisma.attendance.findFirst({
      where: { id: attendanceId, deletedAt: null },
      include: {
        registration: { include: { activity: true } },
      },
    });
    if (!row) throw new NotFoundException('Attendance not found');
    if (
      requester.role === Role.COORDINATOR &&
      row.registration.activity.supervisorId !== requester.sub
    ) {
      throw new ForbiddenException('Not your activity');
    }
    const next =
      status === 'APPROVED'
        ? AttendanceStatus.APPROVED
        : AttendanceStatus.REJECTED;
    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: { status: next },
    });
  }

  pendingForCoordinator(userId: string, role: Role) {
    const staff: Role[] = [Role.ADMIN, Role.COORDINATOR];
    if (!staff.includes(role)) {
      throw new ForbiddenException();
    }
    const where =
      role === Role.ADMIN
        ? {
            status: AttendanceStatus.PENDING_APPROVAL,
            deletedAt: null,
          }
        : {
            status: AttendanceStatus.PENDING_APPROVAL,
            deletedAt: null,
            registration: {
              activity: { supervisorId: userId },
            },
          };
    return this.prisma.attendance.findMany({
      where,
      include: {
        registration: {
          include: { student: true, activity: true },
        },
      },
    });
  }
}
