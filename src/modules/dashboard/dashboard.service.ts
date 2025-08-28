import { Injectable } from '@nestjs/common';
import { InsightsDto } from './dto/insights.dto';
import { UsageDto } from './dto/usage.dto';
import { CoreKpisDto, OtherKpisDto } from './dto/kpis.dto';

@Injectable()
export class DashboardService {
  getInsights(): InsightsDto {
    return {
      activeTenants: 289,
      currentUsagePct: 65,
      pendingIssues: 12,
      monthlyEarningsUSD: 2438
    };
  }

  getUsage(): UsageDto {
    return {
      tokens: { 
        consumed: 258, 
        limit: 1000 
      },
      series: [
        { day: 23, value: 16 },
        { day: 24, value: 38 },
        { day: 25, value: 63 },
        { day: 26, value: 24 },
        { day: 27, value: 43 },
        { day: 28, value: 52 },
        { day: 29, value: 61 },
        { day: 30, value: 74 }
      ]
    };
  }

  getCoreKpis(): CoreKpisDto {
    return {
      generationSpeed: { 
        avgDraftTimeMinutes: 12, 
        improvementPct: 40 
      },
      accuracyRelevance: { 
        avgDraftTimeMinutes: 12, 
        improvementPct: 40 
      },
      adoptionUsage: { 
        proposalsPerUser: 68, 
        usersIncreasingPct: 40 
      },
      successRate: { 
        aiWinRatePct: 48, 
        previousAveragePct: 21 
      }
    };
  }

  getOtherKpis(): OtherKpisDto {
    return {
      generationSpeed: { 
        avgDraftTimeMinutes: 12, 
        improvementPct: 40 
      },
      accuracyRelevance: { 
        avgDraftTimeMinutes: 12, 
        improvementPct: 40 
      }
    };
  }
} 