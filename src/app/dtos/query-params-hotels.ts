//NOTE: We don't need to use this, as we have CLI plugin enabled
//However here we needed description which is not posssible
//without manually setting ApiProperty decorator
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';

export class QueryParamsDTO {
  @ApiProperty({
    description: 'Page number e.g. $page=1',
    required: false,
  })
  $price?: number;

  @ApiProperty({
    description: 'How many records per page should be returned e.g. $rpp=10',
    required: false,
  })
  $amenities?: ObjectId[];

  @ApiProperty({
    description:
      'How to apply ordering to the returned data e.g. $orderBy=name desc',
    required: false,
  })
  $guest_rating?: number;

  @ApiProperty({
    description:
      'How to apply ordering to the returned data e.g. $sort_by=name desc',
    required: false,
  })
  $sort_by?: string;

}
