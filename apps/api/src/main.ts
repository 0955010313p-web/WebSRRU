import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  // Configure CORS: allow specific origins from `CORS_ORIGIN` (comma-separated).
  // For local development, allow all origins when NODE_ENV !== 'production'.
  const origins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
  const allowAllInDev = process.env.NODE_ENV !== 'production' || process.env.CORS_ALLOW_ALL === 'true';
  app.enableCors({
    origin: allowAllInDev ? true : origins.length ? origins : false,
    credentials: true,
  });

  // Security headers: load `helmet` dynamically so app still compiles if package isn't installed
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const helmetPkg: any = require('helmet');
    if (helmetPkg) app.use(helmetPkg());
  } catch (e) {
    // Helmet not installed — skip applying security headers here.
    // In production, install `helmet` and restart the server.
    // console.warn('helmet not available; skipping security headers');
  }
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('SRRU Student Activity API')
    .setDescription(
      'REST API for student activity registration, QR attendance, and verification (NestJS + MySQL + Prisma).',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
}

bootstrap();
