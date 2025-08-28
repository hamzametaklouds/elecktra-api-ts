import { ApiProperty } from '@nestjs/swagger';

export class InsightsDto {
  @ApiProperty({
    description: 'Number of active tenants',
    example: 289
  })
  activeTenants: number;

  @ApiProperty({
    description: 'Current usage percentage',
    example: 65
  })
  currentUsagePct: number;

  @ApiProperty({
    description: 'Number of pending issues',
    example: 12
  })
  pendingIssues: number;

  @ApiProperty({
    description: 'Monthly earnings in USD',
    example: 2438
  })
  monthlyEarningsUSD: number;
} 