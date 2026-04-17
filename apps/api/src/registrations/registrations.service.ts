import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ActivityStatus,
  RegistrationStatus,
  Role,
} from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private async getStudent(userId: string) {
    const s = await this.prisma.student.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!s) throw new NotFoundException('Student profile required');
    return s;
  }

  async registerForActivity(userId: string, activityId: string) {
    const student = await this.getStudent(userId);
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, deletedAt: null },
    });
    if (!activity) throw new NotFoundException('Activity not found');
    if (activity.status !== ActivityStatus.PUBLISHED) {
      throw new BadRequestException('Activity is not open for registration');
    }
    const now = new Date();
    if (now > activity.endTime) {
      throw new BadRequestException('Activity has ended');
    }
    if (activity.maxParticipants != null) {
      const count = await this.prisma.registration.count({
        where: {
          activityId,
          status: { in: [RegistrationStatus.CONFIRMED, RegistrationStatus.PENDING] },
          deletedAt: null,
        },
      });
      if (count >= activity.maxParticipants) {
        throw new BadRequestException('Activity is full');
      }
    }
    try {
      const reg = await this.prisma.registration.create({
        data: {
          studentId: student.id,
          activityId,
          status: RegistrationStatus.CONFIRMED,
        },
        include: { activity: true, student: true },
      });
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.email) {
        await this.notifications.sendRegistrationEmail(user.email, reg.activity.title);
      }
      return reg;
    } catch (e: unknown) {
      if (
        e &&
        typeof e === 'object' &&
        'code' in e &&
        (e as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Already registered');
      }
      throw e;
    }
  }

  listMine(userId: string) {
    return this.prisma.registration.findMany({
      where: { student: { userId }, deletedAt: null },
      include: { activity: true, attendances: true },
      orderBy: { registeredAt: 'desc' },
    });
  }

  async listForActivity(activityId: string, requester: { sub: string; role: Role }) {
    const viewers: Role[] = [Role.ADMIN, Role.COORDINATOR, Role.EXECUTIVE];
    if (!viewers.includes(requester.role)) {
      throw new ForbiddenException();
    }
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, deletedAt: null },
    });
    if (!activity) throw new NotFoundException('Activity not found');
    return this.prisma.registration.findMany({
      where: { activityId, deletedAt: null },
      include: {
        student: true,
        attendances: true,
      },
    });
  }

  async setStatus(
    registrationId: string,
    status: RegistrationStatus,
    requester: { sub: string; role: Role },
  ) {
    const staff: Role[] = [Role.ADMIN, Role.COORDINATOR];
    if (!staff.includes(requester.role)) {
      throw new ForbiddenException();
    }
    const reg = await this.prisma.registration.findFirst({
      where: { id: registrationId, deletedAt: null },
      include: { activity: true },
    });
    if (!reg) throw new NotFoundException('Registration not found');
    if (
      requester.role === Role.COORDINATOR &&
      reg.activity.supervisorId !== requester.sub
    ) {
      throw new ForbiddenException('Not your activity');
    }
    return this.prisma.registration.update({
      where: { id: registrationId },
      data: { status },
    });
  }
}
