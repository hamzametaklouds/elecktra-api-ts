import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateKpiUnitDto {
  @ApiProperty({
    description: 'Unit of measurement for the KPI (e.g., "events", "orders", "minutes", "USD")',
    example: 'events'
  })
  @IsString()
  unit: string;
}
