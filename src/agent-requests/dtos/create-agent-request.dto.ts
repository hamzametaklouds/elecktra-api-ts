import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateAgentRequestDto {
  @ApiProperty({ default: '' })
  @IsMongoId()
  agent_id: ObjectId;

} 