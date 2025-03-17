import { PartialType } from '@nestjs/swagger';
import { CreateAgentDto } from './create-agent.dto';
import { IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AgentStatus } from '../agents.schema';

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