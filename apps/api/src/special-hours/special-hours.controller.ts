import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsIn, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SpecialHoursService } from './special-hours.service';

class CreateSpecialDto {
  @IsString()
  @MinLength(3)
  title: string;
  @IsString()
  @MinLength(10)
  description: string;
  @IsInt()
  @Min(1)
  hoursAsked: number;
  @IsOptional()
  @IsString()
  proofPath?: string;
}

class ResolveSpecialDto {
  @IsIn(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';
  @IsOptional()
  @IsInt()
  decidedHours?: number;
}

@ApiTags('special-hours')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('special-hours')
export class SpecialHoursController {
  constructor(private readonly special: SpecialHoursService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Request consideration for external / special hours' })
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateSpecialDto) {
    return this.special.create(user.sub, dto);
  }

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'My special hour requests' })
  mine(@CurrentUser() user: JwtUser) {
    return this.special.listMine(user.sub);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({ summary: 'Pending special hour requests' })
  pending(@CurrentUser() user: JwtUser) {
    return this.special.listPending(user);
  }

  @Patch(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({ summary: 'Approve or reject with optional decided hours' })
  resolve(
    @Param('id') id: string,
    @Body() dto: ResolveSpecialDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.special.resolve(id, dto.status, dto.decidedHours, user);
  }
}
