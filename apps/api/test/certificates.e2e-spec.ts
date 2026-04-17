import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Certificates (e2e)', () => {
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
      await prisma.certificate.deleteMany();
    } catch (e) {
      // ignore if certificate table is not present in some test DB states
    }
    try {
      await prisma.specialHourRequest.deleteMany();
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

  it('generates certificate PDF and verify endpoint works', async () => {
    const ts = Date.now();
    const studentPayload = {
      studentCode: `cert${ts}`,
      password: 'password123',
      email: `cert${ts}@example.com`,
      firstName: 'Cert',
      lastName: 'Tester',
      faculty: 'Fac',
      major: 'Maj',
      yearLevel: 1,
      studentType: 'SPECIAL',
    };

    const regRes = await request(app.getHttpServer()).post('/api/auth/register').send(studentPayload);
    expect([200,201]).toContain(regRes.status);

    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ username: studentPayload.studentCode, password: studentPayload.password });
    const token = login.body.accessToken;

    // ensure student meets hour & activity-count requirements by creating
    // several approved registrations with attendances so transcript.evaluationReady becomes true
    const user = await prisma.user.findUnique({ where: { username: studentPayload.studentCode } });
    if (!user) throw new Error('User not found after register');
    const student = await prisma.student.findFirst({ where: { userId: user.id } });
    if (!student) throw new Error('Student not found after register');

    // create 4 activities and approved registrations+attendances
    for (let i = 0; i < 4; i++) {
      const activity = await prisma.activity.create({
        data: {
          title: `Cert Activity ${i}`,
          description: 'desc',
          category: 'ACADEMIC',
          nature: 'ELECTIVE_REQUIRED',
          level: 'UNIVERSITY',
          supervisorId: user.id,
          startTime: new Date(Date.now() - 1000 * 60 * 60),
          endTime: new Date(Date.now() + 1000 * 60 * 60),
          hours: 20,
        },
      });
      const registration = await prisma.registration.create({ data: { activityId: activity.id, studentId: student.id, status: 'CONFIRMED' } });
      await prisma.attendance.create({ data: { registrationId: registration.id, checkInTime: new Date(), status: 'APPROVED' } });
    }

    // fetch transcript to assert eligibility
    const transcript = await request(app.getHttpServer())
      .get('/api/students/me/transcript')
      .set('Authorization', `Bearer ${token}`);
    // helpful debug output if evaluation not ready
    if (!transcript.body.summary || !transcript.body.summary.evaluationReady) {
      console.error('Transcript debug:', JSON.stringify(transcript.body, null, 2));
    }
    expect(transcript.body.summary.evaluationReady).toBe(true);

    // request PDF
    const res = await request(app.getHttpServer())
      .get('/api/certificates/me/participation.pdf')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    const cd = res.headers['content-disposition'];
    expect(cd).toBeDefined();
    const m = /participation-(.+)\.pdf/.exec(cd || '');
    expect(m).not.toBeNull();
    const certNum = m ? m[1] : '';

    // verify endpoint (public)
    const v = await request(app.getHttpServer()).get(`/api/certificates/verify/${certNum}`);
    expect(v.status).toBe(200);
    expect(v.body.isValid).toBe(true);
    expect(v.body.student).toBeDefined();
    expect(v.body.certificateNumber).toBeDefined();
  }, 20000);
});
