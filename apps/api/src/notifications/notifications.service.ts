import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private createTransport() {
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT') ?? 587;
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    if (!host || !user || !pass) return null;
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async sendRegistrationEmail(to: string, activityTitle: string) {
    const subject = `ลงทะเบียนกิจกรรมสำเร็จ: ${activityTitle}`;
    const body = `คุณได้ลงทะเบียนเข้าร่วมกิจกรรม "${activityTitle}" เรียบร้อยแล้ว`;
    return this.send(to, subject, body);
  }

  async send(to: string, subject: string, body: string) {
    const transport = this.createTransport();
    const from = this.config.get<string>('MAIL_FROM') ?? 'noreply@srru.local';
    try {
      if (transport) {
        await transport.sendMail({ from, to, subject, text: body });
      } else {
        this.logger.log(`[email skipped — no SMTP] To: ${to} | ${subject}`);
      }
      await this.prisma.notificationLog.create({
        data: { toEmail: to, subject, body, success: true },
      });
      return { sent: true };
    } catch (err) {
      this.logger.error('Email send failed', err as Error);
      await this.prisma.notificationLog.create({
        data: {
          toEmail: to,
          subject,
          body,
          success: false,
        },
      });
      return { sent: false };
    }
  }
}
