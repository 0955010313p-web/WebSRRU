import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AttendancesService } from './attendances.service';
import { CheckInDto } from './dto/check-in.dto';
import { ReviewAttendanceDto } from './dto/review-attendance.dto';

@ApiTags('attendances')
@Controller('attendances')
export class AttendancesController {
  constructor(private readonly attendances: AttendancesService) {}

  @Post('check-in')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'QR-based check-in' })
  checkIn(@CurrentUser() user: JwtUser, @Body() dto: CheckInDto) {
    return this.attendances.checkIn(user.sub, dto);
  }

  @Get('pending')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pending attendance approvals' })
  pending(@CurrentUser() user: JwtUser) {
    return this.attendances.pendingForCoordinator(user.sub, user.role as Role);
  }

  @Patch(':id/review')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject attendance' })
  review(
    @Param('id') id: string,
    @Body() dto: ReviewAttendanceDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.attendances.review(id, dto.status, user);
  }
}
