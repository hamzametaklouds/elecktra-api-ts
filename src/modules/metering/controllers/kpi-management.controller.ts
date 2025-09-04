import { Controller, Post, Get, Body, Param, UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { KpiRegistryService } from '../services/kpi-registry.service';
import { CreateKpiDto } from '../dtos/create-kpi.dto';
import { KpiResponseDto } from '../dtos/kpi-response.dto';

@ApiTags('KPI Management')
@Controller('v1/kpi')
export class KpiManagementController {
  private readonly logger = new Logger(KpiManagementController.name);

  constructor(
    private readonly kpiRegistryService: KpiRegistryService,
  ) {}

  @Post('create')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Create a custom KPI for an agent' })
  @ApiResponse({ 
    status: 201, 
    description: 'KPI created successfully',
    type: KpiResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  @ApiResponse({ status: 409, description: 'KPI already exists for this agent' })
  async createCustomKpi(@Body() createKpiDto: CreateKpiDto): Promise<KpiResponseDto> {
    this.logger.log(`Creating custom KPI for agent: ${createKpiDto.agent_id}`, { 
      kpiName: createKpiDto.kpi_name 
    });

    const result = await this.kpiRegistryService.createCustomKpi(createKpiDto);
    
    // Find the newly created KPI in the registry
    const newKpi = result.kpis.find(kpi => kpi.key === createKpiDto.kpi_name);
    
    return {
      kpi_id: newKpi.key,
      agent_id: result.agent_id,
      kpi_key: newKpi.key,
      title: newKpi.title || createKpiDto.kpi_name,
      unit: newKpi.unit || 'unit',
      description: newKpi.description || '',
      created_at: result.updated_at || new Date()
    };
  }

  @Get('agent/:agentId')
  @ApiOperation({ summary: 'Get all KPIs for a specific agent' })
  @ApiParam({ name: 'agentId', description: 'Agent ID', example: 'ag_123' })
  @ApiResponse({ 
    status: 200, 
    description: 'KPIs retrieved successfully',
    type: [KpiResponseDto]
  })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async getAgentKpis(@Param('agentId') agentId: string): Promise<KpiResponseDto[]> {
    this.logger.log(`Fetching KPIs for agent: ${agentId}`);
    
    const kpis = await this.kpiRegistryService.getAgentKpis(agentId);
    
    return kpis.map(kpi => ({
      kpi_id: kpi.key,
      agent_id: agentId,
      kpi_key: kpi.key,
      title: kpi.title || kpi.key,
      unit: kpi.unit || 'unit',
      description: kpi.description || '',
      created_at: new Date() // Note: KPI registry doesn't store individual creation dates
    }));
  }

  @Get('list')
  @ApiOperation({ summary: 'Get all KPIs across all agents' })
  @ApiResponse({ 
    status: 200, 
    description: 'KPIs retrieved successfully',
    type: [KpiResponseDto]
  })
  async getAllKpis(): Promise<KpiResponseDto[]> {
    this.logger.log('Fetching all KPIs');
    
    const allKpis = await this.kpiRegistryService.getAllKpis();
    
    return allKpis.flatMap(registry => 
      registry.kpis.map(kpi => ({
        kpi_id: kpi.key,
        agent_id: registry.agent_id,
        kpi_key: kpi.key,
        title: kpi.title || kpi.key,
        unit: kpi.unit || 'unit',
        description: kpi.description || '',
        created_at: new Date() // Note: KPI registry doesn't store individual creation dates
      }))
    );
  }
}
