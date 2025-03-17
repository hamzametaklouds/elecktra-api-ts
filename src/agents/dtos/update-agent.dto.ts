import { PartialType } from '@nestjs/swagger';
import { CreateAgentDto } from './create-agent.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAgentDto extends PartialType(CreateAgentDto) {
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_disabled?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;
} 