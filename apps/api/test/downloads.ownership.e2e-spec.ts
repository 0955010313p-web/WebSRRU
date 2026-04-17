import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { writeFileSync, mkdirSync } from 'fs';

describe('Downloads ownership (e2e)', () => {
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
    // cleanup created data by truncating important tables used here
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

  it('coordinator supervising activity can download student proof; other student cannot', async () => {
    const ts = Date.now();
    // create coordinator user
    const coordPass = 'coordpass';
    const coordUser = await prisma.user.create({
      data: {
        username: `coord${ts}`,
        passwordHash: await bcrypt.hash(coordPass, 12),
        role: Role.COORDINATOR,
        isActive: true,
      },
    });

    // register a student via API (uses register endpoint)
    const studentPayload = {
      studentCode: `s${ts}`,
      password: 'studentpass',
      email: `s${ts}@example.com`,
      firstName: 'Student',
      lastName: 'One',
      faculty: 'Fac',
      major: 'Maj',
      yearLevel: 1,
      studentType: 'REGULAR',
    };
    const regRes = await request(app.getHttpServer()).post('/api/auth/register').send(studentPayload);
    expect([200,201]).toContain(regRes.status);
    const studentUserId = regRes.body.user?.id || regRes.body.user?.id;
      const student = await prisma.student.findFirst({ where: { userId: studentUserId } });
      if (!student) throw new Error('Student not found in test setup');

    // create activity supervised by coordinator
    const now = new Date();
      const activity = await prisma.activity.create({
        data: {
          title: 'Test Activity',
          description: 'desc',
          category: 'ACADEMIC',
          nature: 'ELECTIVE_REQUIRED',
          level: 'UNIVERSITY',
          supervisorId: coordUser.id,
          startTime: new Date(now.getTime() - 1000 * 60 * 60),
          endTime: new Date(now.getTime() + 1000 * 60 * 60),
          hours: 2,
        },
      });

    // create registration and attendance
    const registration = await prisma.registration.create({
      data: {
        activityId: activity.id,
        studentId: student.id,
        status: 'CONFIRMED',
      },
    });

    const key = `uploads/test-proof-${ts}.txt`;
    mkdirSync('uploads', { recursive: true });
    writeFileSync(key, 'proof');

    await prisma.attendance.create({
      data: {
        registrationId: registration.id,
        checkInTime: new Date(),
        proofImagePath: key,
        status: 'APPROVED',
      },
    });

    // login as coordinator
    const coordLogin = await request(app.getHttpServer()).post('/api/auth/login').send({ username: coordUser.username, password: coordPass });
      expect([200, 201]).toContain(coordLogin.status);
    const coordToken = coordLogin.body.accessToken;

    // login as another student (not owner)
    const otherStudentPayload = {
      studentCode: `s2${ts}`,
      password: 'studentpass',
      email: `s2${ts}@example.com`,
      firstName: 'Student',
      lastName: 'Two',
      faculty: 'Fac',
      major: 'Maj',
      yearLevel: 1,
      studentType: 'REGULAR',
    };
    const otherRes = await request(app.getHttpServer()).post('/api/auth/register').send(otherStudentPayload);
    expect([200,201]).toContain(otherRes.status);
    const otherLogin = await request(app.getHttpServer()).post('/api/auth/login').send({ username: otherStudentPayload.studentCode, password: otherStudentPayload.password });
    const otherToken = otherLogin.body.accessToken;

    // coordinator should be able to download
    const coordDownload = await request(app.getHttpServer())
      .get('/api/uploads/download')
      .query({ storage: 'local', key })
      .set('Authorization', `Bearer ${coordToken}`);
    expect(coordDownload.status).toBe(200);

    // owner student should be able to download
    const studentLogin = await request(app.getHttpServer()).post('/api/auth/login').send({ username: studentPayload.studentCode, password: studentPayload.password });
    const studentToken = studentLogin.body.accessToken;
    const studentDownload = await request(app.getHttpServer())
      .get('/api/uploads/download')
      .query({ storage: 'local', key })
      .set('Authorization', `Bearer ${studentToken}`);
    expect(studentDownload.status).toBe(200);

    // other student should be forbidden
    const otherDownload = await request(app.getHttpServer())
      .get('/api/uploads/download')
      .query({ storage: 'local', key })
      .set('Authorization', `Bearer ${otherToken}`);
    expect(otherDownload.status).toBe(403);
  }, 20000);
});
