import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterForActivityDto {
  @ApiProperty()
  @IsString()
  activityId: string;
}
