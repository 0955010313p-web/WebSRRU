import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminUsersService } from './admin-users.service';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminUsers: AdminUsersService) {}

  @Post('users')
  @ApiOperation({ summary: 'Create staff user (coordinator / executive / admin)' })
  createUser(@Body() dto: CreateStaffUserDto) {
    return this.adminUsers.createStaff(dto);
  }

  @Get('users')
  @ApiOperation({ summary: 'List users' })
  listUsers() {
    return this.adminUsers.listUsers();
  }
}
