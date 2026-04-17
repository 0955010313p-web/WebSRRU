import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { Response } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.COORDINATOR, Role.EXECUTIVE)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('activity/:activityId/roster.xlsx')
  @ApiOperation({ summary: 'Download Excel roster for an activity' })
  async roster(
    @Param('activityId') activityId: string,
    @Res({ passthrough: false }) res: Response,
  ) {
    const buf = await this.reports.activityRosterBuffer(activityId);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="activity-${activityId}-roster.xlsx"`,
    );
    res.send(buf);
  }
}
