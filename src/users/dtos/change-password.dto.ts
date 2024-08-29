import { ObjectId } from 'mongoose';
import { IsMongoId, IsBoolean, IsOptional, IsString, IsEnum, IsArray, IsEmail, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChnagePasswordDto {

  @ApiProperty({
    description: 'old_password string e.g old_password= mnb',
    required: true,
    default: '',
  })
  @IsString()
  old_password: string;

  @ApiProperty({
    description: 'new_password string e.g new_password= abc',
    required: true,
    default: '',
  })
  @IsString()
  new_password: string;
}