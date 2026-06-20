import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SpecialHoursService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    data: { title: string; description: string; hoursAsked: number; proofPath?: string },
  ) {
    const student = await this.prisma.student.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!student) throw new NotFoundException('Student not found');
    return this.prisma.specialHourRequest.create({
      data: {
        studentId: student.id,
        title: data.title,
        description: data.description,
        hoursAsked: data.hoursAsked,
        proofPath: data.proofPath,
      },
    });
  }

  async listMine(userId: string) {
    const student = await this.prisma.student.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!student) throw new NotFoundException('Student not found');
    return this.prisma.specialHourRequest.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  listPending(requester: { role: Role }) {
    const staff: Role[] = [Role.ADMIN, Role.COORDINATOR];
    if (!staff.includes(requester.role)) {
      throw new ForbiddenException();
    }
    return this.prisma.specialHourRequest.findMany({
      where: { status: 'PENDING' },
      include: { student: true },
    });
  }

  async resolve(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    decidedHours: number | undefined,
    requester: { role: Role },
  ) {
    const staff: Role[] = [Role.ADMIN, Role.COORDINATOR];
    if (!staff.includes(requester.role)) {
      throw new ForbiddenException();
    }
    const row = await this.prisma.specialHourRequest.findFirst({ where: { id } });
    if (!row) throw new NotFoundException('Request not found');
    return this.prisma.specialHourRequest.update({
      where: { id },
      data: {
        status,
        decidedHours:
          status === 'APPROVED' ? (decidedHours ?? row.hoursAsked) : null,
      },
    });
  }
}
