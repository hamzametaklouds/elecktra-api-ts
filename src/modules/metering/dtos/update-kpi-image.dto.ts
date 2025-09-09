import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateKpiImageDto {
  @ApiProperty({
    description: 'New image URL for the KPI',
    example: 'https://example.com/new-kpi-image.png'
  })
  @IsString()
  image_url: string;
}
