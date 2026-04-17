import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { ActivitiesModule } from './activities/activities.module';
import { AmendmentsModule } from './amendments/amendments.module';
import { AttendancesModule } from './attendances/attendances.module';
import { CertificatesModule } from './certificates/certificates.module';
import { CreditTransfersModule } from './credit-transfers/credit-transfers.module';
import { HealthController } from './health/health.controller';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { ReportsModule } from './reports/reports.module';
import { SpecialHoursModule } from './special-hours/special-hours.module';
import { StudentsModule } from './students/students.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60, // 60 seconds
          limit: 120,
        },
      ],
    }),
    PrismaModule,
    NotificationsModule,
    AuthModule,
    StudentsModule,
    ActivitiesModule,
    RegistrationsModule,
    AttendancesModule,
    AmendmentsModule,
    SpecialHoursModule,
    CreditTransfersModule,
    ReportsModule,
    CertificatesModule,
    AnalyticsModule,
    AdminModule,
    UploadsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
