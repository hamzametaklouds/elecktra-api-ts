import { PartialType } from '@nestjs/swagger';
import { CreateAgentRequestDto } from './create-agent-request.dto';
import { IsEnum, IsBoolean, IsOptional, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AgentRequestStatus } from '../agent-requests.constants';
import { Type } from 'class-transformer';

export class UpdateAgentRequestDto extends PartialType(CreateAgentRequestDto) {
  @ApiProperty({
    enum: AgentRequestStatus,
    description: 'Request status',
    example: AgentRequestStatus.SUBMITTED
  })
  @IsEnum(AgentRequestStatus)
  @IsOptional()
  status?: AgentRequestStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  delivery_date?: Date;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_disabled?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;
} 