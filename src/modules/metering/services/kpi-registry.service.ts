import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { KpiRegistry } from '../schemas/kpi-registry.schema';
import { METERING_PROVIDER_TOKENS } from '../metering.model';

@Injectable()
export class KpiRegistryService {
  constructor(
    @Inject(METERING_PROVIDER_TOKENS.KPI_REGISTRY) private kpiRegistry: Model<KpiRegistry>,
  ) {}

  /**
   * Upsert KPI registry for an agent
   * @param agent_id Agent ID
   * @param kpis Array of allowed KPIs
   * @returns Updated KPI registry
   */
  async upsert(agent_id: string, kpis: Array<{ key: string; title?: string; unit?: string; description?: string }>) {
    return await this.kpiRegistry.findOneAndUpdate(
      { agent_id },
      { 
        agent_id,
        kpis,
        updated_at: new Date()
      },
      { upsert: true, new: true }
    );
  }

  /**
   * Get KPI registry for an agent
   * @param agent_id Agent ID
   * @returns KPI registry or null
   */
  async get(agent_id: string) {
    return await this.kpiRegistry.findOne({ agent_id }).lean();
  }

  /**
   * Check if a KPI key is allowed for an agent
   * @param agent_id Agent ID
   * @param kpi_key KPI key to check
   * @returns boolean indicating if KPI is allowed
   */
  async isKpiAllowed(agent_id: string, kpi_key: string): Promise<boolean> {
    const registry = await this.get(agent_id);
    if (!registry) return false;
    
    return registry.kpis.some(kpi => kpi.key === kpi_key);
  }

  /**
   * Create a custom KPI for an agent
   * @param createKpiDto KPI creation data
   * @returns Created KPI registry entry
   */
  async createCustomKpi(createKpiDto: { agent_id: string; kpi_name: string; title?: string; unit?: string; description?: string }) {
    const { agent_id, kpi_name, title, unit, description } = createKpiDto;
    
    // Check if KPI already exists
    const existingRegistry = await this.get(agent_id);
    if (existingRegistry && existingRegistry.kpis.some(kpi => kpi.key === kpi_name)) {
      throw new Error(`KPI with key '${kpi_name}' already exists for agent '${agent_id}'`);
    }

    // Create new KPI entry
    const newKpi = {
      key: kpi_name,
      title: title || kpi_name,
      unit: unit || 'unit',
      description: description || ''
    };

    // Add to existing registry or create new one
    if (existingRegistry) {
      const updatedKpis = [...existingRegistry.kpis, newKpi];
      return await this.upsert(agent_id, updatedKpis);
    } else {
      return await this.upsert(agent_id, [newKpi]);
    }
  }

  /**
   * Get all KPIs for a specific agent
   * @param agent_id Agent ID
   * @returns Array of KPIs
   */
  async getAgentKpis(agent_id: string) {
    const registry = await this.get(agent_id);
    return registry ? registry.kpis : [];
  }

  /**
   * Get all KPIs across all agents
   * @returns Array of all KPI registries
   */
  async getAllKpis() {
    return await this.kpiRegistry.find({}).lean();
  }
}
