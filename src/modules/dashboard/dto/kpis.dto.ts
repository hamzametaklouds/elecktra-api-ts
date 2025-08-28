import { ApiProperty } from '@nestjs/swagger';

export class KpiMetricDto {
  @ApiProperty({
    description: 'Average draft time in minutes',
    example: 12
  })
  avgDraftTimeMinutes: number;

  @ApiProperty({
    description: 'Improvement percentage',
    example: 40
  })
  improvementPct: number;
}

export class AdoptionUsageDto {
  @ApiProperty({
    description: 'Proposals per user',
    example: 68
  })
  proposalsPerUser: number;

  @ApiProperty({
    description: 'Percentage of users increasing',
    example: 40
  })
  usersIncreasingPct: number;
}

export class SuccessRateDto {
  @ApiProperty({
    description: 'AI win rate percentage',
    example: 48
  })
  aiWinRatePct: number;

  @ApiProperty({
    description: 'Previous average percentage',
    example: 21
  })
  previousAveragePct: number;
}

export class CoreKpisDto {
  @ApiProperty({
    description: 'Generation speed metrics',
    type: KpiMetricDto
  })
  generationSpeed: KpiMetricDto;

  @ApiProperty({
    description: 'Accuracy and relevance metrics',
    type: KpiMetricDto
  })
  accuracyRelevance: KpiMetricDto;

  @ApiProperty({
    description: 'Adoption and usage metrics',
    type: AdoptionUsageDto
  })
  adoptionUsage: AdoptionUsageDto;

  @ApiProperty({
    description: 'Success rate metrics',
    type: SuccessRateDto
  })
  successRate: SuccessRateDto;
}

export class OtherKpisDto {
  @ApiProperty({
    description: 'Generation speed metrics',
    type: KpiMetricDto
  })
  generationSpeed: KpiMetricDto;

  @ApiProperty({
    description: 'Accuracy and relevance metrics',
    type: KpiMetricDto
  })
  accuracyRelevance: KpiMetricDto;
} 