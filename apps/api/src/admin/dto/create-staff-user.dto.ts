import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

const STAFF_ROLES = [Role.COORDINATOR, Role.ADMIN, Role.EXECUTIVE] as const;

export class CreateStaffUserDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: STAFF_ROLES })
  @IsIn(STAFF_ROLES as unknown as string[])
  role: (typeof STAFF_ROLES)[number];
}
