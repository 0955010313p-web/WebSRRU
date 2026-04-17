import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ActivityCategory,
  ActivityLevel,
  ActivityNature,
  ActivityStatus,
} from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateActivityDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ enum: ActivityCategory })
  @IsEnum(ActivityCategory)
  category: ActivityCategory;

  @ApiProperty({ enum: ActivityNature })
  @IsEnum(ActivityNature)
  nature: ActivityNature;

  @ApiProperty({ enum: ActivityLevel })
  @IsEnum(ActivityLevel)
  level: ActivityLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isMakeup?: boolean;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  hours: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;

  @ApiProperty()
  @IsDateString()
  startTime: string;

  @ApiProperty()
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ enum: ActivityStatus })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;
}
