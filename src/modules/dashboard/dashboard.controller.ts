import { Controller, Get, UseInterceptors, CacheInterceptor } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { InsightsDto } from './dto/insights.dto';
import { UsageDto } from './dto/usage.dto';
import { CoreKpisDto, OtherKpisDto } from './dto/kpis.dto';

@ApiTags('dashboard')
@Controller('api/v1/dashboard')
@UseInterceptors(CacheInterceptor)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('insights')
  @ApiOperation({ summary: 'Get dashboard insights data' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dashboard insights retrieved successfully',
    type: InsightsDto
  })
  getInsights(): InsightsDto {
    return this.dashboardService.getInsights();
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get dashboard usage data' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dashboard usage data retrieved successfully',
    type: UsageDto
  })
  getUsage(): UsageDto {
    return this.dashboardService.getUsage();
  }

  @Get('kpis/core')
  @ApiOperation({ summary: 'Get core KPIs data' })
  @ApiResponse({ 
    status: 200, 
    description: 'Core KPIs data retrieved successfully',
    type: CoreKpisDto
  })
  getCoreKpis(): CoreKpisDto {
    return this.dashboardService.getCoreKpis();
  }

  @Get('kpis/other')
  @ApiOperation({ summary: 'Get other KPIs data' })
  @ApiResponse({ 
    status: 200, 
    description: 'Other KPIs data retrieved successfully',
    type: OtherKpisDto
  })
  getOtherKpis(): OtherKpisDto {
    return this.dashboardService.getOtherKpis();
  }
} 