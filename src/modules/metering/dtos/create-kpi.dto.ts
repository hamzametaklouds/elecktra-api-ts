import { IsString, IsOptional, IsEnum, ValidateIf, IsObject, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { GraphType } from '../enums/graph-type.enum';
import { KpiType } from '../enums/kpi-type.enum';
import { ValueType } from '../enums/value-type.enum';

export class AxisConfig {
  @ApiProperty({
    description: 'Name of the axis',
    example: 'date_time'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of the axis data',
    example: 'datetime'
  })
  @IsString()
  type: string;
}

export class CreateKpiDto {
  @ApiProperty({
    description: 'Agent ID',
    example: 'ag_123'
  })
  @IsString() 
  agent_id: string;
  
  @ApiProperty({
    description: 'KPI name',
    example: 'Messages Sent'
  })
  @IsString() 
  kpi_name: string;

  @ApiProperty({
    description: 'KPI image URL (optional)',
    example: 'https://example.com/kpi-image.png',
    required: false
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    description: 'Type of KPI display - image for single value display, graph for chart visualization, count for numeric values',
    enum: KpiType,
    example: KpiType.COUNT,
    required: false,
    default: KpiType.COUNT
  })
  @IsOptional()
  @IsEnum(KpiType)
  @Transform(({ value }) => value || KpiType.COUNT)
  type?: KpiType;

  @ApiProperty({
    description: 'Graph type for displaying the KPI data (only used when type is graph)',
    enum: GraphType,
    example: GraphType.LINE,
    required: false
  })
  @ValidateIf(o => o.type === KpiType.GRAPH)
  @IsEnum(GraphType)
  graph_type?: GraphType;

  @ApiProperty({
    description: 'X-axis configuration for graph type KPIs',
    required: false,
    type: AxisConfig
  })
  @ValidateIf(o => o.type === KpiType.GRAPH)
  @IsObject()
  @Type(() => AxisConfig)
  xAxis?: AxisConfig;

  @ApiProperty({
    description: 'Y-axis configuration for graph type KPIs',
    required: false,
    type: AxisConfig
  })
  @ValidateIf(o => o.type === KpiType.GRAPH)
  @IsObject()
  @Type(() => AxisConfig)
  yAxis?: AxisConfig;

  @ApiProperty({
    description: 'Name of the time unit for count type KPIs',
    example: 'time',
    required: false
  })
  @ValidateIf(o => o.type === KpiType.COUNT)
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Value type for the KPI (Int, Percentage, Seconds, Minutes, Hours)',
    enum: ValueType,
    example: ValueType.INT,
    required: false
  })
  @ValidateIf(o => o.type === KpiType.COUNT)
  @IsEnum(ValueType)
  value_type?: ValueType;

  @ApiProperty({
    description: 'Initial value for count type KPIs',
    example: 0,
    required: false
  })
  @ValidateIf(o => o.type === KpiType.COUNT)
  @IsNumber()
  initial_value?: number;
}
