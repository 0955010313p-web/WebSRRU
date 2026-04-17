import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsInt, IsString, Min, MinLength } from 'class-validator';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreditTransfersService } from './credit-transfers.service';

class CreateCreditTransferDto {
  @IsString()
  studentCode: string;
  @IsString()
  @MinLength(3)
  title: string;
  @IsInt()
  @Min(1)
  hoursGranted: number;
  @IsString()
  grantedCategory: string;
}

@ApiTags('credit-transfers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.COORDINATOR)
@Controller('credit-transfers')
export class CreditTransfersController {
  constructor(private readonly credit: CreditTransfersService) {}

  @Post()
  @ApiOperation({ summary: 'Record credit transfer / leadership hours' })
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateCreditTransferDto) {
    return this.credit.create(user.sub, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.EXECUTIVE)
  @ApiOperation({ summary: 'List transfers' })
  list(@CurrentUser() user: JwtUser) {
    return this.credit.list(user);
  }
}
