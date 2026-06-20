import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AmendmentsService } from './amendments.service';

class CreateAmendmentDto {
  @IsString()
  registrationId: string;
  @IsString()
  @MinLength(5)
  reason: string;
  @IsOptional()
  @IsString()
  proofPath?: string;
}

class ResolveAmendmentDto {
  @IsIn(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';
}

@ApiTags('amendments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('amendments')
export class AmendmentsController {
  constructor(private readonly amendments: AmendmentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Student requests data correction' })
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateAmendmentDto) {
    return this.amendments.create(user.sub, dto.registrationId, dto.reason, dto.proofPath);
  }

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'My amendment requests' })
  mine(@CurrentUser() user: JwtUser) {
    return this.amendments.listMine(user.sub);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({ summary: 'Pending amendment requests' })
  pending(@CurrentUser() user: JwtUser) {
    return this.amendments.listPending(user);
  }

  @Patch(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({ summary: 'Approve or reject amendment' })
  resolve(
    @Param('id') id: string,
    @Body() dto: ResolveAmendmentDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.amendments.resolve(id, dto.status, user);
  }
}
