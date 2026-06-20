import {
  PrismaClient,
  Role,
  ActivityStatus,
  StudentType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SRRU_ACTIVITY_CATALOG } from '../src/common/srru-activity-catalog';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  const coordHash = await bcrypt.hash('Coord123!', 12);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      role: Role.ADMIN,
      email: 'admin@srru.local',
    },
  });

  const coordinator = await prisma.user.upsert({
    where: { username: 'coordinator' },
    update: {},
    create: {
      username: 'coordinator',
      passwordHash: coordHash,
      role: Role.COORDINATOR,
      email: 'dsa@srru.local',
    },
  });

  await prisma.user.upsert({
    where: { username: 'executive' },
    update: {},
    create: {
      username: 'executive',
      passwordHash: await bcrypt.hash('Exec123!', 12),
      role: Role.EXECUTIVE,
      email: 'exec@srru.local',
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { username: '64100001' },
    update: {},
    create: {
      username: '64100001',
      passwordHash: await bcrypt.hash('Student123!', 12),
      role: Role.STUDENT,
      email: '64100001@srru.local',
      student: {
        create: {
          studentCode: '64100001',
          firstName: 'ทดสอบ',
          lastName: 'ระบบ',
          faculty: 'วิทยาศาสตร์และเทคโนโลยี',
          major: 'วิทยาการคอมพิวเตอร์',
          yearLevel: 2,
          studentType: StudentType.REGULAR,
        },
      },
    },
    include: { student: true },
  });

  const baseStart = new Date();
  baseStart.setDate(baseStart.getDate() + 7);

  let created = 0;
  for (let i = 0; i < SRRU_ACTIVITY_CATALOG.length; i++) {
    const item = SRRU_ACTIVITY_CATALOG[i];
    const start = new Date(baseStart);
    start.setDate(start.getDate() + i * 3);
    const end = new Date(start);
    end.setHours(end.getHours() + 3);

    const existing = await prisma.activity.findFirst({
      where: { title: item.title, deletedAt: null },
    });
    if (existing) {
      await prisma.activity.update({
        where: { id: existing.id },
        data: {
          description: item.description,
          category: item.category,
          nature: item.nature,
          level: item.level,
          hours: item.hours,
          eligibleYears: item.eligibleYears,
          studentProgram: item.studentProgram,
          leaderOnly: item.leaderOnly ?? false,
          status: ActivityStatus.PUBLISHED,
        },
      });
      continue;
    }

    await prisma.activity.create({
      data: {
        title: item.title,
        description: item.description,
        category: item.category,
        nature: item.nature,
        level: item.level,
        hours: item.hours,
        eligibleYears: item.eligibleYears,
        studentProgram: item.studentProgram,
        leaderOnly: item.leaderOnly ?? false,
        maxParticipants: 500,
        startTime: start,
        endTime: end,
        status: ActivityStatus.PUBLISHED,
        supervisorId: coordinator.id,
      },
    });
    created++;
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete.', {
    admin: admin.username,
    coordinator: coordinator.username,
    student: studentUser.username,
    activitiesSeeded: SRRU_ACTIVITY_CATALOG.length,
    activitiesCreated: created,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
