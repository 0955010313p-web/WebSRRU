import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { RegisterForActivityDto } from './dto/register-for-activity.dto';
import { UpdateRegistrationStatusDto } from './dto/update-registration-status.dto';
import { RegistrationsService } from './registrations.service';

@ApiTags('registrations')
@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrations: RegistrationsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Student registers for an activity' })
  register(@CurrentUser() user: JwtUser, @Body() dto: RegisterForActivityDto) {
    return this.registrations.registerForActivity(user.sub, dto.activityId);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'My registrations' })
  mine(@CurrentUser() user: JwtUser) {
    return this.registrations.listMine(user.sub);
  }

  @Get('activity/:activityId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.EXECUTIVE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Roster for an activity' })
  forActivity(
    @Param('activityId') activityId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.registrations.listForActivity(activityId, user);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update registration status' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRegistrationStatusDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.registrations.setStatus(id, dto.status, user);
  }
}
