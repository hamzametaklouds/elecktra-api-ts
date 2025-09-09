import { Controller, Post, Get, Put, Body, Param, UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { KpiRegistryService } from '../services/kpi-registry.service';
import { CreateKpiDto } from '../dtos/create-kpi.dto';
import { KpiResponseDto } from '../dtos/kpi-response.dto';
import { UpdateKpiGraphTypeDto } from '../dtos/update-kpi-graph-type.dto';
import { UpdateKpiImageDto } from '../dtos/update-kpi-image.dto';
import { UpdateKpiTypeDto, KpiGraphDataDto, AddKpiGraphDataPointDto } from '../dtos/kpi-graph-data.dto';
import { GraphType } from '../enums/graph-type.enum';
import { KpiType } from '../enums/kpi-type.enum';

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
    
    // Find the newly created KPI in the registry (it should be the last one added)
    const newKpi = result.kpis[result.kpis.length - 1];
    
    if (!newKpi) {
      throw new Error('Failed to create KPI - no KPI found in result');
    }
    
    return {
      kpi_id: newKpi.key,
      agent_id: result.agent_id.toString(),
      kpi_key: newKpi.key,
      title: newKpi.title || createKpiDto.kpi_name,
      unit: newKpi.unit || 'unit',
      description: newKpi.description || '',
      image: newKpi.image || 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI',
      type: newKpi.type || KpiType.IMAGE,
      graph_type: newKpi.graph_type || GraphType.LINE,
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
      image: kpi.image || 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI',
      type: kpi.type || KpiType.IMAGE,
      graph_type: kpi.graph_type || GraphType.LINE,
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
        agent_id: registry.agent_id.toString(),
        kpi_key: kpi.key,
        title: kpi.title || kpi.key,
        unit: kpi.unit || 'unit',
        description: kpi.description || '',
        image: kpi.image || 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI',
        type: kpi.type || KpiType.IMAGE,
        graph_type: kpi.graph_type || GraphType.LINE,
        created_at: new Date() // Note: KPI registry doesn't store individual creation dates
      }))
    );
  }

  @Put('agent/:agentId/kpi/:kpiKey/image')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Update image for a specific KPI' })
  @ApiParam({ name: 'agentId', description: 'Agent ID', example: 'ag_123' })
  @ApiParam({ name: 'kpiKey', description: 'KPI Key', example: '1000' })
  @ApiBody({ type: UpdateKpiImageDto })
  @ApiResponse({ 
    status: 200, 
    description: 'KPI image updated successfully',
    type: KpiResponseDto
  })
  @ApiResponse({ status: 404, description: 'Agent or KPI not found' })
  async updateKpiImage(
    @Param('agentId') agentId: string,
    @Param('kpiKey') kpiKey: string,
    @Body() updateKpiImageDto: UpdateKpiImageDto
  ): Promise<KpiResponseDto> {
    this.logger.log(`Updating image for KPI ${kpiKey} of agent ${agentId}`);
    
    const result = await this.kpiRegistryService.updateKpiImage(agentId, kpiKey, updateKpiImageDto.image_url);
    
    if (!result) {
      throw new Error('Agent or KPI not found');
    }

    // Find the updated KPI
    const updatedKpi = result.kpis.find(kpi => kpi.key === kpiKey);
    if (!updatedKpi) {
      throw new Error('KPI not found after update');
    }
    
    return {
      kpi_id: updatedKpi.key,
      agent_id: result.agent_id.toString(),
      kpi_key: updatedKpi.key,
      title: updatedKpi.title || updatedKpi.key,
      unit: updatedKpi.unit || 'unit',
      description: updatedKpi.description || '',
      image: updatedKpi.image || 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI',
      type: updatedKpi.type || KpiType.IMAGE,
      graph_type: updatedKpi.graph_type || GraphType.LINE,
      created_at: result.updated_at || new Date()
    };
  }

  @Put('agent/:agentId/kpi/:kpiKey/graph-type')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Update graph type for a specific KPI' })
  @ApiParam({ name: 'agentId', description: 'Agent ID', example: 'ag_123' })
  @ApiParam({ name: 'kpiKey', description: 'KPI Key', example: '1000' })
  @ApiBody({ type: UpdateKpiGraphTypeDto })
  @ApiResponse({ 
    status: 200, 
    description: 'KPI graph type updated successfully',
    type: KpiResponseDto
  })
  @ApiResponse({ status: 404, description: 'Agent or KPI not found' })
  async updateKpiGraphType(
    @Param('agentId') agentId: string,
    @Param('kpiKey') kpiKey: string,
    @Body() updateKpiGraphTypeDto: UpdateKpiGraphTypeDto
  ): Promise<KpiResponseDto> {
    this.logger.log(`Updating graph type for KPI ${kpiKey} of agent ${agentId}`);
    
    const result = await this.kpiRegistryService.updateKpiGraphType(agentId, kpiKey, updateKpiGraphTypeDto.graph_type);
    
    if (!result) {
      throw new Error('Agent or KPI not found');
    }

    // Find the updated KPI
    const updatedKpi = result.kpis.find(kpi => kpi.key === kpiKey);
    if (!updatedKpi) {
      throw new Error('KPI not found after update');
    }
    
    return {
      kpi_id: updatedKpi.key,
      agent_id: result.agent_id.toString(),
      kpi_key: updatedKpi.key,
      title: updatedKpi.title || updatedKpi.key,
      unit: updatedKpi.unit || 'unit',
      description: updatedKpi.description || '',
      image: updatedKpi.image || 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI',
      type: updatedKpi.type || KpiType.IMAGE,
      graph_type: updatedKpi.graph_type || GraphType.LINE,
      created_at: result.updated_at || new Date()
    };
  }

  @Put('agent/:agentId/kpi/:kpiKey/type')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Update type for a specific KPI' })
  @ApiParam({ name: 'agentId', description: 'Agent ID', example: 'ag_123' })
  @ApiParam({ name: 'kpiKey', description: 'KPI Key', example: '1000' })
  @ApiBody({ type: UpdateKpiTypeDto })
  @ApiResponse({ 
    status: 200, 
    description: 'KPI type updated successfully',
    type: KpiResponseDto
  })
  @ApiResponse({ status: 404, description: 'Agent or KPI not found' })
  async updateKpiType(
    @Param('agentId') agentId: string,
    @Param('kpiKey') kpiKey: string,
    @Body() updateKpiTypeDto: UpdateKpiTypeDto
  ): Promise<KpiResponseDto> {
    this.logger.log(`Updating type for KPI ${kpiKey} of agent ${agentId}`);
    
    const result = await this.kpiRegistryService.updateKpiType(agentId, kpiKey, updateKpiTypeDto.type as KpiType);
    
    if (!result) {
      throw new Error('Agent or KPI not found');
    }

    // Find the updated KPI
    const updatedKpi = result.kpis.find(kpi => kpi.key === kpiKey);
    if (!updatedKpi) {
      throw new Error('KPI not found after update');
    }
    
    return {
      kpi_id: updatedKpi.key,
      agent_id: result.agent_id.toString(),
      kpi_key: updatedKpi.key,
      title: updatedKpi.title || updatedKpi.key,
      unit: updatedKpi.unit || 'unit',
      description: updatedKpi.description || '',
      image: updatedKpi.image || 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI',
      type: updatedKpi.type || KpiType.IMAGE,
      graph_type: updatedKpi.graph_type || GraphType.LINE,
      created_at: result.updated_at || new Date()
    };
  }

  @Get('agent/:agentId/kpi/:kpiKey/graph-data')
  @ApiOperation({ summary: 'Get graph data for a specific KPI' })
  @ApiParam({ name: 'agentId', description: 'Agent ID', example: 'ag_123' })
  @ApiParam({ name: 'kpiKey', description: 'KPI Key', example: '1000' })
  @ApiResponse({ 
    status: 200, 
    description: 'Graph data retrieved successfully',
    type: KpiGraphDataDto
  })
  @ApiResponse({ status: 404, description: 'Graph data not found' })
  async getKpiGraphData(
    @Param('agentId') agentId: string,
    @Param('kpiKey') kpiKey: string
  ): Promise<KpiGraphDataDto | null> {
    this.logger.log(`Fetching graph data for KPI ${kpiKey} of agent ${agentId}`);
    
    const graphData = await this.kpiRegistryService.getKpiGraphData(agentId, kpiKey);
    
    if (!graphData) {
      return null;
    }
    
    return {
      agent_id: graphData.agent_id.toString(),
      kpi_key: graphData.kpi_key,
      data_points: graphData.data_points,
      created_at: graphData.created_at,
      updated_at: graphData.updated_at
    };
  }

  @Post('agent/:agentId/kpi/:kpiKey/graph-data')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Add data point to KPI graph' })
  @ApiParam({ name: 'agentId', description: 'Agent ID', example: 'ag_123' })
  @ApiParam({ name: 'kpiKey', description: 'KPI Key', example: '1000' })
  @ApiBody({ type: AddKpiGraphDataPointDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Data point added successfully',
    type: KpiGraphDataDto
  })
  async addKpiGraphDataPoint(
    @Param('agentId') agentId: string,
    @Param('kpiKey') kpiKey: string,
    @Body() addKpiGraphDataPointDto: AddKpiGraphDataPointDto
  ): Promise<KpiGraphDataDto> {
    this.logger.log(`Adding data point to KPI ${kpiKey} of agent ${agentId}`);
    
    const result = await this.kpiRegistryService.addKpiGraphDataPoint(
      agentId, 
      kpiKey, 
      addKpiGraphDataPointDto
    );
    
    return {
      agent_id: result.agent_id.toString(),
      kpi_key: result.kpi_key,
      data_points: result.data_points,
      created_at: result.created_at,
      updated_at: result.updated_at
    };
  }

  @Get('agent/:agentId/graph-data')
  @ApiOperation({ summary: 'Get all graph data for an agent' })
  @ApiParam({ name: 'agentId', description: 'Agent ID', example: 'ag_123' })
  @ApiResponse({ 
    status: 200, 
    description: 'Graph data retrieved successfully',
    type: [KpiGraphDataDto]
  })
  async getAgentGraphData(@Param('agentId') agentId: string): Promise<KpiGraphDataDto[]> {
    this.logger.log(`Fetching all graph data for agent ${agentId}`);
    
    const graphDataList = await this.kpiRegistryService.getAgentGraphData(agentId);
    
    return graphDataList.map(graphData => ({
      agent_id: graphData.agent_id.toString(),
      kpi_key: graphData.kpi_key,
      data_points: graphData.data_points,
      created_at: graphData.created_at,
      updated_at: graphData.updated_at
    }));
  }
}
