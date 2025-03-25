import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MaintenanceStatus } from '../delivered-agents.schema';

export class UpdateClientAgentDto {
  @ApiProperty({
    enum: MaintenanceStatus,
    description: 'Agent status',
    example: MaintenanceStatus.ACTIVE
  })
  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  
} 