import { ApiProperty } from '@nestjs/swagger';
import { RegistrationStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateRegistrationStatusDto {
  @ApiProperty({ enum: RegistrationStatus })
  @IsEnum(RegistrationStatus)
  status: RegistrationStatus;
}
