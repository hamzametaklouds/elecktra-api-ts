import { ApiProperty } from '@nestjs/swagger';

export class UsageSeriesDto {
  @ApiProperty({
    description: 'Day of the month',
    example: 23
  })
  day: number;

  @ApiProperty({
    description: 'Usage value for the day',
    example: 16
  })
  value: number;
}

export class UsageTokensDto {
  @ApiProperty({
    description: 'Number of tokens consumed',
    example: 258
  })
  consumed: number;

  @ApiProperty({
    description: 'Token limit',
    example: 1000
  })
  limit: number;
}

export class UsageDto {
  @ApiProperty({
    description: 'Token usage information',
    type: UsageTokensDto
  })
  tokens: UsageTokensDto;

  @ApiProperty({
    description: 'Daily usage series',
    type: [UsageSeriesDto]
  })
  series: UsageSeriesDto[];
} 