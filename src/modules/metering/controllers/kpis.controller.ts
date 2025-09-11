import { Controller, Post, Body, UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { KpiRegistryService } from '../services/kpi-registry.service';
import { CreateKpiDto } from '../dtos/create-kpi.dto';
import { GraphType } from '../enums/graph-type.enum';
import { KpiType } from '../enums/kpi-type.enum';

@Controller('v1/kpis')
export class KpisController {
  private readonly logger = new Logger(KpisController.name);

  constructor(
    private readonly kpiRegistryService: KpiRegistryService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createKpi(@Body() createKpiDto: CreateKpiDto) {
    this.logger.log(`Creating KPI for agent: ${createKpiDto.agent_id}`, { 
      kpiName: createKpiDto.kpi_name 
    });

    const result = await this.kpiRegistryService.createCustomKpi(createKpiDto);
    
    // Find the newly created KPI in the registry (it should be the last one added)
    const newKpi = result.kpis[result.kpis.length - 1];
    
    if (!newKpi) {
      throw new Error('Failed to create KPI - no KPI found in result');
    }
    
    return {
      kpi_id: parseInt(newKpi.key),
      key: newKpi.key,
      kpi_name: createKpiDto.kpi_name,
      unit: newKpi.unit || 'units',
      image: newKpi.image || 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI',
      type: newKpi.type || KpiType.IMAGE,
      graph_type: newKpi.graph_type || GraphType.LINE
    };
  }
}
