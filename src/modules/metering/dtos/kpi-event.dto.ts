import { IsString, IsNumber, IsOptional, IsDateString, ValidateIf, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { KpiType } from '../enums/kpi-type.enum';
import { ValueType } from '../enums/value-type.enum';

export class BaseKpiEventDto {
  @ApiProperty({
    description: 'Event type',
    example: 'job.started'
  })
  @IsString()
  event_type: string;

  @ApiProperty({
    description: 'Agent ID',
    example: '68b9642500c2c50c52c3649e'
  })
  @IsString()
  agent_id: string;

  @ApiProperty({
    description: 'Execution ID',
    example: 'exec_123'
  })
  @IsString()
  execution_id: string;

  @ApiProperty({
    description: 'Timestamp',
    example: '2025-09-12T10:00:00.000Z'
  })
  @IsDateString()
  timestamp: string;

  @ApiProperty({
    description: 'KPI key',
    example: '1006'
  })
  @IsString()
  kpi_key: string;
}

export class CountKpiEventDto extends BaseKpiEventDto {
  @ApiProperty({
    description: 'Value for count type KPI',
    example: 22
  })
  @IsNumber()
  value: number;

  @ApiProperty({
    description: 'Value type for the KPI',
    enum: ValueType,
    example: ValueType.INT
  })
  @IsEnum(ValueType)
  value_type: ValueType;
}

export class GraphKpiEventDto extends BaseKpiEventDto {
  @ApiProperty({
    description: 'Date/time for the data point',
    example: '2025-09-12T10:00:00.000Z'
  })
  @IsDateString()
  date_time: string;

  @ApiProperty({
    description: 'Number of events',
    example: 44
  })
  @IsNumber()
  events: number;
}

export class KpiEventDto {
  @ApiProperty({
    description: 'Event type',
    example: 'job.started'
  })
  @IsString()
  event_type: string;

  @ApiProperty({
    description: 'Agent ID',
    example: '68b9642500c2c50c52c3649e'
  })
  @IsString()
  agent_id: string;

  @ApiProperty({
    description: 'Execution ID',
    example: 'exec_123'
  })
  @IsString()
  execution_id: string;

  @ApiProperty({
    description: 'Timestamp',
    example: '2025-09-12T10:00:00.000Z'
  })
  @IsDateString()
  timestamp: string;

  @ApiProperty({
    description: 'KPI key',
    example: '1006'
  })
  @IsString()
  kpi_key: string;

  @ApiProperty({
    description: 'Value for count type KPI',
    example: 22,
    required: false
  })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiProperty({
    description: 'Date/time for the data point',
    example: '2025-09-12T10:00:00.000Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  date_time?: string;

  @ApiProperty({
    description: 'Number of events',
    example: 44,
    required: false
  })
  @IsOptional()
  @IsNumber()
  events?: number;
}
