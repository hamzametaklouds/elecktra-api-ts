import { ApiProperty } from '@nestjs/swagger';
import { GraphType } from '../enums/graph-type.enum';
import { KpiType } from '../enums/kpi-type.enum';

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
    description: 'KPI image URL',
    example: 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI'
  })
  image: string;

  @ApiProperty({
    description: 'Type of KPI display - image for single value display, graph for chart visualization',
    enum: KpiType,
    example: KpiType.IMAGE,
    default: KpiType.IMAGE
  })
  type: KpiType;

  @ApiProperty({
    description: 'Graph type for displaying the KPI data (only used when type is graph)',
    enum: GraphType,
    example: GraphType.LINE,
    default: GraphType.LINE
  })
  graph_type: GraphType;

  @ApiProperty({
    description: 'When the KPI was created',
    example: '2025-01-04T20:00:00.000Z'
  })
  created_at: Date;
}
