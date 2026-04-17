import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CreditTransfersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    approverId: string,
    dto: {
      studentCode: string;
      title: string;
      hoursGranted: number;
      grantedCategory: string;
    },
  ) {
    const student = await this.prisma.student.findFirst({
      where: { studentCode: dto.studentCode, deletedAt: null },
    });
    if (!student) throw new NotFoundException('Student not found');
    return this.prisma.creditTransfer.create({
      data: {
        studentId: student.id,
        title: dto.title,
        hoursGranted: dto.hoursGranted,
        grantedCategory: dto.grantedCategory,
        approvedById: approverId,
      },
    });
  }

  list(requester: { role: Role }) {
    const viewers: Role[] = [Role.ADMIN, Role.COORDINATOR, Role.EXECUTIVE];
    if (!viewers.includes(requester.role)) {
      throw new ForbiddenException();
    }
    return this.prisma.creditTransfer.findMany({
      where: { deletedAt: null },
      include: { student: true, approvedBy: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
