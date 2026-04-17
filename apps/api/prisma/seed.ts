import { PrismaClient, Role, ActivityStatus, ActivityCategory, ActivityNature, ActivityLevel, StudentType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

  const execUser = await prisma.user.upsert({
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

  const start = new Date();
  start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setHours(end.getHours() + 3);

  const activity = await prisma.activity.create({
    data: {
      title: 'กิจกรรมปฐมนิเทศนักศึกษา (ตัวอย่าง)',
      description:
        'กิจกรรมตัวอย่างสำหรับทดสอบระบบลงทะเบียนและสแกน QR เช็คชื่อ',
      category: ActivityCategory.ACADEMIC,
      nature: ActivityNature.CORE_REQUIRED,
      level: ActivityLevel.UNIVERSITY,
      hours: 5,
      maxParticipants: 200,
      startTime: start,
      endTime: end,
      status: ActivityStatus.PUBLISHED,
      supervisorId: coordinator.id,
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seed complete.', {
    admin: admin.username,
    coordinator: coordinator.username,
    executive: execUser.username,
    student: studentUser.username,
    activityId: activity.id,
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
