import { ApiProperty } from '@nestjs/swagger';
import { StudentType } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  IsNotEmpty,
} from 'class-validator';

export class RegisterStudentDto {
  @ApiProperty({ description: 'Student ID used as login username' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(24)
  studentCode: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  faculty: string;

  @ApiProperty()
  @IsString()
  major: string;

  @ApiProperty({ minimum: 1, maximum: 8 })
  @IsInt()
  @Min(1)
  @Max(8)
  yearLevel: number;

  @ApiProperty({ enum: StudentType })
  @IsEnum(StudentType)
  studentType: StudentType;
}
