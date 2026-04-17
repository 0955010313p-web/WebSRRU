import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Security (e2e)', () => {
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

  it('/api/uploads/download should require authentication (401)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/uploads/download')
      .query({ storage: 'local', key: 'uploads/test.txt' });

    expect(res.status).toBe(401);
  });

  it('/api/attendances/check-in should require authentication (401)', async () => {
    const payload = { activityId: 'nonexistent', qrSecret: 'nope' };
    const res = await request(app.getHttpServer())
      .post('/api/attendances/check-in')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).toBe(401);
  });
});
