//NOTE: We don't need to use this, as we have CLI plugin enabled
//However here we needed description which is not posssible
//without manually setting ApiProperty decorator
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class QueryParamsDTO {
  @ApiProperty({
    description: 'Page number e.g. $page=1',
    required: false,
  })
  $page?: number;

  @ApiProperty({
    description: 'How many records per page should be returned e.g. $rpp=10',
    required: false,
  })
  $rpp?: number;

  @ApiProperty({
    description:
      'How to apply ordering to the returned data e.g. $orderBy=name desc',
    required: false,
  })
  $orderBy?: string;

  @ApiProperty({
    description:
      'How to apply filter to the returned data e.g. $filter=price lt 10.00',
    required: false,
  })
  $filter?: string;
}
