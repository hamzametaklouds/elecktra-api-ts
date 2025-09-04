import { ApiProperty } from '@nestjs/swagger';

export class KpiResponseDto {
  @ApiProperty({
    description: 'Unique KPI ID',
    example: 'kpi_123'
  })
  kpi_id: string;

  @ApiProperty({
    description: 'Agent ID',
    example: 'ag_123'
  })
  agent_id: string;

  @ApiProperty({
    description: 'KPI key/name',
    example: 'messages_sent'
  })
  kpi_key: string;

  @ApiProperty({
    description: 'Display title for the KPI',
    example: 'Messages Sent'
  })
  title: string;

  @ApiProperty({
    description: 'Unit of measurement',
    example: 'count'
  })
  unit: string;

  @ApiProperty({
    description: 'Description of what this KPI measures',
    example: 'Total number of messages sent by the agent'
  })
  description: string;

  @ApiProperty({
    description: 'When the KPI was created',
    example: '2025-01-04T20:00:00.000Z'
  })
  created_at: Date;
}
