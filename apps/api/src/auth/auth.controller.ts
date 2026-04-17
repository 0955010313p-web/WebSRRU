import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterStudentDto } from './dto/register-student.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Student self-registration' })
  register(@Body() dto: RegisterStudentDto) {
    return this.auth.registerStudent(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login (JWT)' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}
