import { PartialType } from '@nestjs/swagger';
import { CreateAgentDto } from './create-agent.dto';
import { IsBoolean, IsOptional, IsEnum, IsArray, ValidateNested, IsMongoId, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AgentStatus } from '../agents.schema';
import { ObjectId } from 'mongoose';
import { Type } from 'class-transformer';



export class UpdateAgentDto extends PartialType(CreateAgentDto) {
  @ApiProperty({
    enum: AgentStatus,
    description: 'Agent status',
    example: AgentStatus.ACTIVE
  })
  @IsEnum(AgentStatus)
  @IsOptional()
  status?: AgentStatus;


  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_disabled?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;
} 