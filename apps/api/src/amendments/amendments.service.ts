import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AmendmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, registrationId: string, reason: string, proofPath?: string) {
    const student = await this.prisma.student.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!student) throw new NotFoundException('Student not found');
    const reg = await this.prisma.registration.findFirst({
      where: { id: registrationId, studentId: student.id, deletedAt: null },
    });
    if (!reg) throw new NotFoundException('Registration not found');
    return this.prisma.amendmentRequest.create({
      data: { registrationId, reason, proofPath },
    });
  }

  async listMine(userId: string) {
    const student = await this.prisma.student.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!student) throw new NotFoundException('Student not found');
    return this.prisma.amendmentRequest.findMany({
      where: { registration: { studentId: student.id } },
      include: { registration: { include: { activity: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  listPending(requester: { sub: string; role: Role }) {
    const staff: Role[] = [Role.ADMIN, Role.COORDINATOR];
    if (!staff.includes(requester.role)) {
      throw new ForbiddenException();
    }
    return this.prisma.amendmentRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        registration: { include: { student: true, activity: true } },
      },
    });
  }

  async resolve(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    requester: { sub: string; role: Role },
  ) {
    const staff: Role[] = [Role.ADMIN, Role.COORDINATOR];
    if (!staff.includes(requester.role)) {
      throw new ForbiddenException();
    }
    const row = await this.prisma.amendmentRequest.findFirst({
      where: { id },
      include: { registration: { include: { activity: true } } },
    });
    if (!row) throw new NotFoundException('Request not found');
    if (
      requester.role === Role.COORDINATOR &&
      row.registration.activity.supervisorId !== requester.sub
    ) {
      throw new ForbiddenException();
    }
    return this.prisma.amendmentRequest.update({
      where: { id },
      data: { status },
    });
  }
}
