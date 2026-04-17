import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CheckInDto {
  @ApiProperty()
  @IsString()
  activityId: string;

  @ApiProperty({ description: 'Must match current activity QR secret' })
  @IsString()
  @MinLength(8)
  qrSecret: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  proofImagePath?: string;
}
