import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateAgentRequestDto {
  @ApiProperty({ default: '' })
  @IsMongoId()
  agent_id: ObjectId;

  @ApiProperty({ default: [''], type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  workflow_ids: ObjectId[];
} 