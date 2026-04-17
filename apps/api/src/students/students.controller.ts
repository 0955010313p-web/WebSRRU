import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { StudentsService } from './students.service';

@ApiTags('students')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('students')
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Current student profile' })
  async me(@CurrentUser() user: JwtUser) {
    if (user.role !== Role.STUDENT) {
      return { message: 'Profile endpoint is primary for students', user };
    }
    return this.students.getByUserId(user.sub);
  }

  @Get('me/transcript')
  @ApiOperation({ summary: 'Participation transcript and hour summary' })
  async transcript(@CurrentUser() user: JwtUser) {
    return this.students.transcript(user.sub);
  }

  @Get('me/hours')
  @ApiOperation({ summary: 'Aggregated hour calculation' })
  async hours(@CurrentUser() user: JwtUser) {
    const s = await this.students.getByUserId(user.sub);
    return this.students.summarizeHours(s.id);
  }

  @Get(':studentId/summary')
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.EXECUTIVE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Staff view: hour summary for a student' })
  async staffSummary(@Param('studentId') studentId: string) {
    return this.students.summarizeHours(studentId);
  }
}
