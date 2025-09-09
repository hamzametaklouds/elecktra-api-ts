import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { GraphType } from '../enums/graph-type.enum';
import { KpiType } from '../enums/kpi-type.enum';

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
    description: 'Type of KPI display - image for single value display, graph for chart visualization',
    enum: KpiType,
    example: KpiType.IMAGE,
    required: false,
    default: KpiType.IMAGE
  })
  @IsOptional()
  @IsEnum(KpiType)
  @Transform(({ value }) => value || KpiType.IMAGE)
  type?: KpiType;

  @ApiProperty({
    description: 'Graph type for displaying the KPI data (only used when type is graph)',
    enum: GraphType,
    example: GraphType.LINE,
    required: false,
    default: GraphType.LINE
  })
  @IsOptional()
  @IsEnum(GraphType)
  @Transform(({ value }) => value || GraphType.LINE)
  graph_type?: GraphType;
}
