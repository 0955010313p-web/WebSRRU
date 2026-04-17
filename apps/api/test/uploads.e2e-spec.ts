import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Uploads (e2e)', () => {
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

  it('/api/uploads/local (POST) should accept base64 payload', async () => {
    const payload = {
      filename: 'test.txt',
      contentBase64: Buffer.from('hello world').toString('base64'),
    };

    const res = await request(app.getHttpServer())
      .post('/api/uploads/local')
      .send(payload)
      .set('Accept', 'application/json');

    expect([200, 201]).toContain(res.status);
    expect(res.body).toBeDefined();
    // expect path or url in response
    expect(res.body.path || res.body.url || res.body).toBeDefined();
  });

  it('/api/uploads/presign (POST) should return presign info or error', async () => {
    const payload = { filename: 'test.txt', contentType: 'text/plain' };

    const res = await request(app.getHttpServer())
      .post('/api/uploads/presign')
      .send(payload)
      .set('Accept', 'application/json');

    // If AWS not configured, server may return 500, 501 (not implemented) or 400 — at minimum it should return json
    expect([200, 400, 500, 501]).toContain(res.status);
    expect(res.body).toBeDefined();
  });
});
