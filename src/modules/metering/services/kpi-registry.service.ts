import { Injectable, Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { KpiRegistry } from '../schemas/kpi-registry.schema';
import { METERING_PROVIDER_TOKENS } from '../metering.model';

@Injectable()
export class KpiRegistryService {
  constructor(
    @Inject(METERING_PROVIDER_TOKENS.KPI_REGISTRY) private kpiRegistry: Model<KpiRegistry>,
  ) {}

  /**
   * Upsert KPI registry for an agent
   * @param agent_id Agent ID (string or ObjectId)
   * @param kpis Array of allowed KPIs
   * @returns Updated KPI registry
   */
  async upsert(agent_id: string | Types.ObjectId, kpis: Array<{ key: string; title?: string; unit?: string; description?: string }>) {
    const agentObjectId = typeof agent_id === 'string' ? new Types.ObjectId(agent_id) : agent_id;
    
    return await this.kpiRegistry.findOneAndUpdate(
      { agent_id: agentObjectId },
      { 
        agent_id: agentObjectId,
        kpis,
        updated_at: new Date()
      },
      { upsert: true, new: true }
    );
  }

  /**
   * Get KPI registry for an agent
   * @param agent_id Agent ID (string or ObjectId)
   * @returns KPI registry or null
   */
  async get(agent_id: string | Types.ObjectId) {
    const agentObjectId = typeof agent_id === 'string' ? new Types.ObjectId(agent_id) : agent_id;
    return await this.kpiRegistry.findOne({ agent_id: agentObjectId }).lean();
  }

  /**
   * Check if a KPI key is allowed for an agent
   * @param agent_id Agent ID (string or ObjectId)
   * @param kpi_key KPI key to check
   * @returns boolean indicating if KPI is allowed
   */
  async isKpiAllowed(agent_id: string | Types.ObjectId, kpi_key: string): Promise<boolean> {
    const registry = await this.get(agent_id);
    if (!registry) return false;
    
    return registry.kpis.some(kpi => kpi.key === kpi_key);
  }

  /**
   * Create a custom KPI for an agent
   * @param createKpiDto KPI creation data
   * @returns Created KPI registry entry
   */
  async createCustomKpi(createKpiDto: { agent_id: string | Types.ObjectId; kpi_name: string }) {
    const { agent_id, kpi_name } = createKpiDto;
    
    // Get or create registry for this agent
    const existingRegistry = await this.get(agent_id);
    
    // Generate next numeric KPI ID
    let nextId = 1000; // default fallback
    
    if (existingRegistry && existingRegistry.kpis.length > 0) {
      // Parse existing kpi keys as numbers and find max
      const numericKeys = existingRegistry.kpis
        .map(kpi => parseInt(kpi.key))
        .filter(num => !isNaN(num));
      
      if (numericKeys.length > 0) {
        nextId = Math.max(...numericKeys) + 1;
      }
    }
    
    const kpiKey = String(nextId);
    
    // Check if this key already exists (shouldn't happen with our logic, but safety check)
    if (existingRegistry && existingRegistry.kpis.some(kpi => kpi.key === kpiKey)) {
      throw new Error(`KPI with key '${kpiKey}' already exists for agent '${agent_id}'`);
    }

    // Create new KPI entry
    const newKpi = {
      key: kpiKey,
      title: kpi_name,
      unit: 'unit',
      description: ''
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
   * @param agent_id Agent ID (string or ObjectId)
   * @returns Array of KPIs
   */
  async getAgentKpis(agent_id: string | Types.ObjectId) {
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
