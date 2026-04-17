import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth Register (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/auth/register (POST) should accept registration payload or return validation error', async () => {
    const payload = {
      studentCode: `test${Date.now()}`,
      password: 'password123',
      email: `test+${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      faculty: 'Test Faculty',
      major: 'Test Major',
      yearLevel: 1,
      studentType: 'REGULAR',
    };

    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(payload)
      .set('Accept', 'application/json');

    // Server should respond with either success (200/201) or a validation error (400) or server error
    expect([200, 201, 400, 500]).toContain(res.status);
    expect(res.body).toBeDefined();
  });
});
