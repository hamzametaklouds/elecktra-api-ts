import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsMongoId, IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateChannelDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  members: ObjectId[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  agent_requests: ObjectId[];
} 