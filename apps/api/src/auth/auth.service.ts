import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { retry } from '../utils/retry.helper';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterStudentDto } from './dto/register-student.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async registerStudent(dto: RegisterStudentDto) {
    const exists = await this.prisma.user.findUnique({
      where: { username: dto.studentCode },
    });
    if (exists) throw new ConflictException('Username already registered');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    // Some test environments may trigger transient write conflicts/deadlocks
    // when creating many users concurrently. Retry a few times before
    // surfacing the error to make tests more stable.
    const user = await retry(() =>
      this.prisma.user.create({
        data: {
          username: dto.studentCode,
          passwordHash,
          role: Role.STUDENT,
          email: dto.email,
          student: {
            create: {
              studentCode: dto.studentCode,
              firstName: dto.firstName,
              lastName: dto.lastName,
              faculty: dto.faculty,
              major: dto.major,
              yearLevel: dto.yearLevel,
              studentType: dto.studentType,
            },
          },
        },
        include: { student: true },
      }),
      3,
      120,
    );
    return this.issueTokens(user.id, user.username, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { username: dto.username, deletedAt: null },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user.id, user.username, user.role);
  }

  private issueTokens(userId: string, username: string, role: Role) {
    const payload = { sub: userId, username, role };
    const accessToken = this.jwt.sign(payload);
    return {
      accessToken,
      tokenType: 'Bearer' as const,
      expiresIn: '8h',
      user: { id: userId, username, role },
    };
  }
}
