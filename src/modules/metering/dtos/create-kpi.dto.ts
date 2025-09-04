import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateKpiDto {
  @ApiProperty({
    description: 'Agent ID for which to create the KPI',
    example: 'ag_123'
  })
  @IsString()
  agent_id: string;

  @ApiProperty({
    description: 'Name of the KPI',
    example: 'messages_sent'
  })
  @IsString()
  kpi_name: string;

  @ApiProperty({
    description: 'Display title for the KPI',
    example: 'Messages Sent',
    required: false
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Unit of measurement for the KPI',
    example: 'count',
    required: false
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    description: 'Description of what this KPI measures',
    example: 'Total number of messages sent by the agent',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;
}
