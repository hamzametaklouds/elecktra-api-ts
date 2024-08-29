import { ObjectId } from 'mongoose';
import { IsMongoId, IsBoolean, IsOptional, IsString, IsEnum, IsArray, IsEmail, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BroadNotificationsDto {

  @ApiProperty({
    description: 'fcm_tokens string array e.g fcm_tokens= ["a","b","c"]',
    required: true,
    default: [''],
  })
  @IsArray()
  fcm_tokens: string[];
}