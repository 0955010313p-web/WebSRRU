import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ActivityStatus, Role, StudentType } from '@prisma/client';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@ApiTags('activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activities: ActivitiesService) {}

  @Get('rules')
  @ApiOperation({ summary: 'SRRU graduation rules and activity hour policy' })
  rules() {
    return this.activities.graduationRules();
  }

  @Get()
  @ApiOperation({ summary: 'List activities (published by default)' })
  @ApiQuery({ name: 'status', required: false, enum: ActivityStatus })
  @ApiQuery({ name: 'yearLevel', required: false, type: Number })
  @ApiQuery({ name: 'studentType', required: false, enum: StudentType })
  list(
    @Query('status') status?: ActivityStatus,
    @Query('yearLevel') yearLevel?: string,
    @Query('studentType') studentType?: StudentType,
  ) {
    return this.activities.listPublic({
      status: status ?? ActivityStatus.PUBLISHED,
      yearLevel: yearLevel ? Number(yearLevel) : undefined,
      studentType,
    });
  }

  @Get('managed/all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Staff: list all activities (any status)' })
  @ApiQuery({ name: 'status', required: false, enum: ActivityStatus })
  managed(@Query('status') status?: ActivityStatus) {
    return this.activities.listManaged(
      status !== undefined ? { status } : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Activity detail' })
  detail(@Param('id') id: string) {
    return this.activities.get(id);
  }

  @Get(':id/qr')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Payload to encode as QR for check-in' })
  async qr(@Param('id') id: string) {
    const a = await this.activities.getWithSecret(id);
    return this.activities.qrPayload(a.id, a.qrSecret);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create activity' })
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateActivityDto) {
    return this.activities.create(user.sub, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update activity' })
  update(@Param('id') id: string, @Body() dto: UpdateActivityDto) {
    return this.activities.update(id, dto);
  }

  @Post(':id/rotate-qr')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rotate QR secret' })
  rotateQr(@Param('id') id: string) {
    return this.activities.rotateQr(id);
  }
}
