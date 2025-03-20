import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsMongoId, IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ type: [String], required: false, description: 'Array of user IDs to mention' })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  user_mentions?: ObjectId[];

  @ApiProperty({ type: [String], required: false, description: 'Array of agent request IDs to mention' })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  agent_mentions?: ObjectId[];
} 