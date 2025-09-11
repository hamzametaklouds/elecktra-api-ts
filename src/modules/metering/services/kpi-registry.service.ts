import { Injectable, Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { KpiRegistry } from '../schemas/kpi-registry.schema';
import { KpiGraphData } from '../schemas/kpi-graph-data.schema';
import { METERING_PROVIDER_TOKENS } from '../metering.model';
import { GraphType } from '../enums/graph-type.enum';
import { KpiType } from '../enums/kpi-type.enum';

@Injectable()
export class KpiRegistryService {
  constructor(
    @Inject(METERING_PROVIDER_TOKENS.KPI_REGISTRY) private kpiRegistry: Model<KpiRegistry>,
    @Inject(METERING_PROVIDER_TOKENS.KPI_GRAPH_DATA) private kpiGraphData: Model<KpiGraphData>,
  ) {}

  /**
   * Ensure all KPIs have an image field with default if missing
   * @param kpis Array of KPIs
   * @returns Array of KPIs with image field guaranteed
   */
  private ensureKpisHaveImages(kpis: Array<{ key: string; title?: string; unit?: string; description?: string; image?: string; type?: KpiType; graph_type?: GraphType }>) {
    return kpis.map(kpi => ({
      ...kpi,
      image: kpi.image || 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI',
      type: kpi.type || KpiType.IMAGE,
      graph_type: kpi.graph_type || GraphType.LINE
    }));
  }

  /**
   * Upsert KPI registry for an agent
   * @param agent_id Agent ID (string or ObjectId)
   * @param kpis Array of allowed KPIs
   * @returns Updated KPI registry
   */
  async upsert(agent_id: string | Types.ObjectId, kpis: Array<{ key: string; title?: string; unit?: string; description?: string; image?: string; type?: KpiType; graph_type?: GraphType }>) {
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
    const registry = await this.kpiRegistry.findOne({ agent_id: agentObjectId }).lean();
    if (registry && registry.kpis) {
      registry.kpis = this.ensureKpisHaveImages(registry.kpis);
    }
    return registry;
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
  async createCustomKpi(createKpiDto: { agent_id: string | Types.ObjectId; kpi_name: string; image?: string; type?: KpiType; graph_type?: GraphType; unit?: string }) {
    const { agent_id, kpi_name, image, type, graph_type, unit } = createKpiDto;
    
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
      unit: unit || 'units',
      description: '',
      image: image || 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI',
      type: type || KpiType.IMAGE,
      graph_type: graph_type || GraphType.LINE
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
    return registry ? this.ensureKpisHaveImages(registry.kpis) : [];
  }

  /**
   * Get all KPIs across all agents
   * @returns Array of all KPI registries
   */
  async getAllKpis() {
    const registries = await this.kpiRegistry.find({}).lean();
    return registries.map(registry => ({
      ...registry,
      kpis: this.ensureKpisHaveImages(registry.kpis)
    }));
  }

  /**
   * Update image for a specific KPI
   * @param agent_id Agent ID (string or ObjectId)
   * @param kpi_key KPI key to update
   * @param image_url New image URL
   * @returns Updated KPI registry or null if not found
   */
  async updateKpiImage(agent_id: string | Types.ObjectId, kpi_key: string, image_url: string) {
    const agentObjectId = typeof agent_id === 'string' ? new Types.ObjectId(agent_id) : agent_id;
    
    const registry = await this.kpiRegistry.findOne({ agent_id: agentObjectId });
    if (!registry) {
      return null;
    }

    // Find and update the specific KPI
    const kpiIndex = registry.kpis.findIndex(kpi => kpi.key === kpi_key);
    if (kpiIndex === -1) {
      return null;
    }

    // Update the KPI image
    registry.kpis[kpiIndex].image = image_url;
    registry.updated_at = new Date();

    return await registry.save();
  }

  /**
   * Update graph type for a specific KPI
   * @param agent_id Agent ID (string or ObjectId)
   * @param kpi_key KPI key to update
   * @param graph_type New graph type
   * @returns Updated KPI registry or null if not found
   */
  async updateKpiGraphType(agent_id: string | Types.ObjectId, kpi_key: string, graph_type: GraphType) {
    const agentObjectId = typeof agent_id === 'string' ? new Types.ObjectId(agent_id) : agent_id;
    
    const registry = await this.kpiRegistry.findOne({ agent_id: agentObjectId });
    if (!registry) {
      return null;
    }

    // Find and update the specific KPI
    const kpiIndex = registry.kpis.findIndex(kpi => kpi.key === kpi_key);
    if (kpiIndex === -1) {
      return null;
    }

    // Update the KPI graph type
    registry.kpis[kpiIndex].graph_type = graph_type;
    registry.updated_at = new Date();

    return await registry.save();
  }

  /**
   * Update type for a specific KPI
   * @param agent_id Agent ID (string or ObjectId)
   * @param kpi_key KPI key to update
   * @param type New KPI type
   * @returns Updated KPI registry or null if not found
   */
  async updateKpiType(agent_id: string | Types.ObjectId, kpi_key: string, type: KpiType) {
    const agentObjectId = typeof agent_id === 'string' ? new Types.ObjectId(agent_id) : agent_id;
    
    const registry = await this.kpiRegistry.findOne({ agent_id: agentObjectId });
    if (!registry) {
      return null;
    }

    // Find and update the specific KPI
    const kpiIndex = registry.kpis.findIndex(kpi => kpi.key === kpi_key);
    if (kpiIndex === -1) {
      return null;
    }

    // Update the KPI type
    registry.kpis[kpiIndex].type = type;
    registry.updated_at = new Date();

    return await registry.save();
  }

  /**
   * Update unit for a specific KPI
   * @param agent_id Agent ID (string or ObjectId)
   * @param kpi_key KPI key to update
   * @param unit New KPI unit
   * @returns Updated KPI registry or null if not found
   */
  async updateKpiUnit(agent_id: string | Types.ObjectId, kpi_key: string, unit: string) {
    const agentObjectId = typeof agent_id === 'string' ? new Types.ObjectId(agent_id) : agent_id;
    
    const registry = await this.kpiRegistry.findOne({ agent_id: agentObjectId });
    if (!registry) {
      return null;
    }

    // Find and update the specific KPI
    const kpiIndex = registry.kpis.findIndex(kpi => kpi.key === kpi_key);
    if (kpiIndex === -1) {
      return null;
    }

    // Update the KPI unit (trim whitespace)
    registry.kpis[kpiIndex].unit = unit.trim();
    registry.updated_at = new Date();

    return await registry.save();
  }

  /**
   * Get graph data for a specific KPI
   * @param agent_id Agent ID (string or ObjectId)
   * @param kpi_key KPI key
   * @returns Graph data or null if not found
   */
  async getKpiGraphData(agent_id: string | Types.ObjectId, kpi_key: string) {
    const agentObjectId = typeof agent_id === 'string' ? new Types.ObjectId(agent_id) : agent_id;
    return await this.kpiGraphData.findOne({ 
      agent_id: agentObjectId, 
      kpi_key: kpi_key 
    }).lean();
  }

  /**
   * Add data point to KPI graph
   * @param agent_id Agent ID (string or ObjectId)
   * @param kpi_key KPI key
   * @param dataPoint Data point to add
   * @returns Updated graph data
   */
  async addKpiGraphDataPoint(agent_id: string | Types.ObjectId, kpi_key: string, dataPoint: { x: string; y: number; label?: string }) {
    const agentObjectId = typeof agent_id === 'string' ? new Types.ObjectId(agent_id) : agent_id;
    
    return await this.kpiGraphData.findOneAndUpdate(
      { agent_id: agentObjectId, kpi_key: kpi_key },
      { 
        $push: { data_points: dataPoint },
        $set: { updated_at: new Date() }
      },
      { upsert: true, new: true }
    );
  }

  /**
   * Get all graph data for an agent
   * @param agent_id Agent ID (string or ObjectId)
   * @returns Array of graph data
   */
  async getAgentGraphData(agent_id: string | Types.ObjectId) {
    const agentObjectId = typeof agent_id === 'string' ? new Types.ObjectId(agent_id) : agent_id;
    return await this.kpiGraphData.find({ agent_id: agentObjectId }).lean();
  }
}
