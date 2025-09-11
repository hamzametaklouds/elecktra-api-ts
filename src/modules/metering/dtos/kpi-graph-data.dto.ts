import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DataPointDto {
  @ApiProperty({
    description: 'X-axis value (usually timestamp or category)',
    example: '2025-01-04T10:00:00.000Z'
  })
  @IsString()
  x: string;

  @ApiProperty({
    description: 'Y-axis value (the actual KPI value)',
    example: 150
  })
  @IsNumber()
  y: number;

  @ApiProperty({
    description: 'Optional label for the data point',
    example: 'Morning Peak',
    required: false
  })
  @IsOptional()
  @IsString()
  label?: string;
}

export class KpiGraphDataDto {
  @ApiProperty({
    description: 'Agent ID',
    example: 'ag_123'
  })
  agent_id: string;

  @ApiProperty({
    description: 'KPI Key',
    example: '1000'
  })
  kpi_key: string;

  @ApiProperty({
    description: 'Unit of measurement for the KPI values',
    example: 'events'
  })
  unit: string;

  @ApiProperty({
    description: 'Array of data points for the graph',
    type: [DataPointDto]
  })
  data_points: DataPointDto[];

  @ApiProperty({
    description: 'When the graph data was created',
    example: '2025-01-04T20:00:00.000Z'
  })
  created_at: Date;

  @ApiProperty({
    description: 'When the graph data was last updated',
    example: '2025-01-04T20:00:00.000Z'
  })
  updated_at: Date;
}

export class AddKpiGraphDataPointDto {
  @ApiProperty({
    description: 'X-axis value (usually timestamp or category)',
    example: '2025-01-04T10:00:00.000Z'
  })
  @IsString()
  x: string;

  @ApiProperty({
    description: 'Y-axis value (the actual KPI value)',
    example: 150
  })
  @IsNumber()
  y: number;

  @ApiProperty({
    description: 'Optional label for the data point',
    example: 'Morning Peak',
    required: false
  })
  @IsOptional()
  @IsString()
  label?: string;
}

export class UpdateKpiTypeDto {
  @ApiProperty({
    description: 'Type of KPI display',
    enum: ['image', 'graph'],
    example: 'graph'
  })
  @IsString()
  type: string;
}
