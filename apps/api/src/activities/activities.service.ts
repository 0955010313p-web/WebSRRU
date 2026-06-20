import { Injectable, NotFoundException } from '@nestjs/common';
import { ActivityStatus, Prisma, StudentType } from '@prisma/client';
import { GRADUATION_RULES } from '../common/srru-graduation-rules';
import { SRRU_ACTIVITY_CATALOG } from '../common/srru-activity-catalog';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  private stripQrSecret<T extends { qrSecret?: string }>(row: T) {
    const { qrSecret: _q, ...rest } = row;
    return rest;
  }

  graduationRules() {
    return {
      ...GRADUATION_RULES,
      catalogCount: SRRU_ACTIVITY_CATALOG.length,
    };
  }

  listPublic(filters?: {
    status?: ActivityStatus;
    level?: string;
    yearLevel?: number;
    studentType?: StudentType;
  }) {
    const where: Prisma.ActivityWhereInput = { deletedAt: null };
    if (filters?.status) where.status = filters.status;
    if (filters?.level) where.level = filters.level as never;
    if (filters?.studentType) {
      where.OR = [
        { studentProgram: null },
        { studentProgram: filters.studentType },
      ];
    }
    return this.prisma.activity
      .findMany({
        where,
        orderBy: [{ nature: 'asc' }, { startTime: 'asc' }],
        include: { supervisor: { select: { id: true, username: true } } },
      })
      .then((rows) => {
        const year = filters?.yearLevel;
        const filtered =
          year === undefined
            ? rows
            : rows.filter((r) => {
                const years = r.eligibleYears as number[] | null;
                if (!years || !Array.isArray(years) || years.length === 0) {
                  return true;
                }
                return years.includes(year);
              });
        return filtered.map((r) => this.stripQrSecret(r));
      });
  }

  listManaged(filters?: { status?: ActivityStatus }) {
    const where: Prisma.ActivityWhereInput = { deletedAt: null };
    if (filters?.status) where.status = filters.status;
    return this.prisma.activity
      .findMany({
        where,
        orderBy: { startTime: 'desc' },
        include: { supervisor: { select: { id: true, username: true } } },
      })
      .then((rows) => rows.map((r) => this.stripQrSecret(r)));
  }

  async get(id: string) {
    const a = await this.prisma.activity.findFirst({
      where: { id, deletedAt: null },
      include: { supervisor: { select: { id: true, username: true } } },
    });
    if (!a) throw new NotFoundException('Activity not found');
    // Never expose rotating QR secret on public activity payloads
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { qrSecret: _qs, ...safe } = a;
    return safe;
  }

  async getWithSecret(id: string) {
    const a = await this.prisma.activity.findFirst({
      where: { id, deletedAt: null },
      include: { supervisor: { select: { id: true, username: true } } },
    });
    if (!a) throw new NotFoundException('Activity not found');
    return a;
  }

  create(supervisorId: string, dto: CreateActivityDto) {
    return this.prisma.activity.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        nature: dto.nature,
        level: dto.level,
        isMakeup: dto.isMakeup ?? false,
        eligibleYears: dto.eligibleYears ?? [1, 2, 3, 4],
        studentProgram: dto.studentProgram ?? null,
        leaderOnly: dto.leaderOnly ?? false,
        hours: dto.hours,
        maxParticipants: dto.maxParticipants,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        status: dto.status ?? ActivityStatus.DRAFT,
        supervisorId,
        qrSecret: randomUUID().replace(/-/g, ''),
      },
    });
  }

  async update(id: string, dto: UpdateActivityDto) {
    await this.getWithSecret(id);
    return this.prisma.activity.update({
      where: { id },
      data: {
        ...dto,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
      },
    });
  }

  async rotateQr(id: string) {
    await this.getWithSecret(id);
    const qrSecret = randomUUID().replace(/-/g, '');
    return this.prisma.activity.update({
      where: { id },
      data: { qrSecret },
    });
  }

  qrPayload(activityId: string, qrSecret: string) {
    return { activityId, qrSecret, v: 1 };
  }
}
