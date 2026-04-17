import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

// Increase default timeout for these integration tests
jest.setTimeout(30000);

describe('Check-in edge cases (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterEach(async () => {
    try {
      await prisma.attendance.deleteMany();
      await prisma.registration.deleteMany();
      await prisma.activity.deleteMany();
      await prisma.student.deleteMany();
      await prisma.user.deleteMany();
    } catch (e) {}
    try {
      await prisma.$disconnect();
    } catch (e) {}
    await app.close();
  });

  it('rejects invalid qrSecret', async () => {
    const ts = Date.now();
    const studentPayload = {
      studentCode: `chk${ts}`,
      password: 'p',
      email: `chk${ts}@example.com`,
      firstName: 'C',
      lastName: 'K',
      faculty: 'F',
      major: 'M',
      yearLevel: 1,
      studentType: 'REGULAR',
    };
    await request(app.getHttpServer()).post('/api/auth/register').send(studentPayload);
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ username: studentPayload.studentCode, password: studentPayload.password });
    const token = login.body.accessToken;

    // create activity with different qrSecret
    const now = new Date();
    const activity = await prisma.activity.create({
      data: {
        title: 'A',
        description: 'desc',
        category: 'ACADEMIC',
        nature: 'ELECTIVE_REQUIRED',
        level: 'UNIVERSITY',
        supervisorId: (await prisma.user.create({ data: { username: `s${ts}`, passwordHash: await bcrypt.hash('x', 12), role: Role.COORDINATOR, isActive: true } })).id,
        startTime: new Date(now.getTime() - 1000 * 60 * 60),
        endTime: new Date(now.getTime() + 1000 * 60 * 60),
        hours: 1,
      },
    });

    // register student to activity
    const student = await prisma.student.findFirst({ where: { studentCode: studentPayload.studentCode } });
    if (!student) throw new Error('Student not found in test setup');
    await prisma.registration.create({ data: { activityId: activity.id, studentId: student.id, status: 'CONFIRMED' } });

    const res = await request(app.getHttpServer())
      .post('/api/attendances/check-in')
      .set('Authorization', `Bearer ${token}`)
      .send({ activityId: activity.id, qrSecret: 'invalidtoken' });

    expect([400, 401]).toContain(res.status);
  });

  it('rejects check-in outside window', async () => {
    const ts = Date.now();
    const studentPayload = {
      studentCode: `chk2${ts}`,
      password: 'p',
      email: `chk2${ts}@example.com`,
      firstName: 'C',
      lastName: 'K',
      faculty: 'F',
      major: 'M',
      yearLevel: 1,
      studentType: 'REGULAR',
    };
    await request(app.getHttpServer()).post('/api/auth/register').send(studentPayload);
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ username: studentPayload.studentCode, password: studentPayload.password });
    const token = login.body.accessToken;

    // activity in the past
    const now = new Date();
    const activity = await prisma.activity.create({
      data: {
        title: 'Past',
        description: 'desc',
        category: 'ACADEMIC',
        nature: 'ELECTIVE_REQUIRED',
        level: 'UNIVERSITY',
        supervisorId: (await prisma.user.create({ data: { username: `s2${ts}`, passwordHash: await bcrypt.hash('x', 12), role: Role.COORDINATOR, isActive: true } })).id,
        startTime: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2),
        endTime: new Date(now.getTime() - 1000 * 60 * 60 * 24),
        hours: 1,
      },
    });

    const student = await prisma.student.findFirst({ where: { studentCode: studentPayload.studentCode } });
    if (!student) throw new Error('Student not found in test setup');
    await prisma.registration.create({ data: { activityId: activity.id, studentId: student.id, status: 'CONFIRMED' } });

    const res = await request(app.getHttpServer())
      .post('/api/attendances/check-in')
      .set('Authorization', `Bearer ${token}`)
      .send({ activityId: activity.id, qrSecret: activity.qrSecret });

    expect(res.status).toBe(400);
  });

  it('prevents duplicate check-in', async () => {
    const ts = Date.now();
    const studentPayload = {
      studentCode: `chk3${ts}`,
      password: 'p',
      email: `chk3${ts}@example.com`,
      firstName: 'C',
      lastName: 'K',
      faculty: 'F',
      major: 'M',
      yearLevel: 1,
      studentType: 'REGULAR',
    };
    await request(app.getHttpServer()).post('/api/auth/register').send(studentPayload);
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ username: studentPayload.studentCode, password: studentPayload.password });
    const token = login.body.accessToken;

    const now = new Date();
    const coord = await prisma.user.create({ data: { username: `coord${ts}`, passwordHash: await bcrypt.hash('x', 12), role: Role.COORDINATOR, isActive: true } });
    const activity = await prisma.activity.create({
      data: {
        title: 'Dup',
        description: 'desc',
        category: 'ACADEMIC',
        nature: 'ELECTIVE_REQUIRED',
        level: 'UNIVERSITY',
        supervisorId: coord.id,
        startTime: new Date(now.getTime() - 1000 * 60 * 60),
        endTime: new Date(now.getTime() + 1000 * 60 * 60),
        hours: 1,
      },
    });

    const student = await prisma.student.findFirst({ where: { studentCode: studentPayload.studentCode } });
    if (!student) throw new Error('Student not found in test setup');
    const reg = await prisma.registration.create({ data: { activityId: activity.id, studentId: student.id, status: 'CONFIRMED' } });

    // first check-in
    const r1 = await request(app.getHttpServer())
      .post('/api/attendances/check-in')
      .set('Authorization', `Bearer ${token}`)
      .send({ activityId: activity.id, qrSecret: activity.qrSecret });
    expect([200, 201]).toContain(r1.status);

    // duplicate
    const r2 = await request(app.getHttpServer())
      .post('/api/attendances/check-in')
      .set('Authorization', `Bearer ${token}`)
      .send({ activityId: activity.id, qrSecret: activity.qrSecret });
    expect(r2.status).toBe(400);
  });

  it('allows valid check-in', async () => {
    const ts = Date.now();
    const studentPayload = {
      studentCode: `chk4${ts}`,
      password: 'p',
      email: `chk4${ts}@example.com`,
      firstName: 'C',
      lastName: 'K',
      faculty: 'F',
      major: 'M',
      yearLevel: 1,
      studentType: 'REGULAR',
    };
    await request(app.getHttpServer()).post('/api/auth/register').send(studentPayload);
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ username: studentPayload.studentCode, password: studentPayload.password });
    const token = login.body.accessToken;

    const now = new Date();
    const coord = await prisma.user.create({ data: { username: `coord2${ts}`, passwordHash: await bcrypt.hash('x', 12), role: Role.COORDINATOR, isActive: true } });
    const activity = await prisma.activity.create({
      data: {
        title: 'Good',
        description: 'desc',
        category: 'ACADEMIC',
        nature: 'ELECTIVE_REQUIRED',
        level: 'UNIVERSITY',
        supervisorId: coord.id,
        startTime: new Date(now.getTime() - 1000 * 60 * 60),
        endTime: new Date(now.getTime() + 1000 * 60 * 60),
        hours: 1,
      },
    });

    const student = await prisma.student.findFirst({ where: { studentCode: studentPayload.studentCode } });
    if (!student) throw new Error('Student not found in test setup');
    await prisma.registration.create({ data: { activityId: activity.id, studentId: student.id, status: 'CONFIRMED' } });

    const res = await request(app.getHttpServer())
      .post('/api/attendances/check-in')
      .set('Authorization', `Bearer ${token}`)
      .send({ activityId: activity.id, qrSecret: activity.qrSecret, proofImagePath: `uploads/check-${ts}.txt` });

    expect([200, 201]).toContain(res.status);
  });
});
