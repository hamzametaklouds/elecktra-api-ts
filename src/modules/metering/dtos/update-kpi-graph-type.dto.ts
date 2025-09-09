import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GraphType } from '../enums/graph-type.enum';

export class UpdateKpiGraphTypeDto {
  @ApiProperty({
    description: 'Graph type for displaying the KPI data',
    enum: GraphType,
    example: GraphType.BAR
  })
  @IsEnum(GraphType)
  graph_type: GraphType;
}
