import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { METERING_PROVIDER_TOKENS } from '../metering.model';
import { AgentPricing } from '../schemas/agent-pricing.schema';

export interface AgentValidationResult {
  isValid: boolean;
  reason?: string;
  agent_id?: string;
  pricing_version?: string;
  agent_status?: string;
}

@Injectable()
export class AgentValidationService {
  constructor(
    @Inject(METERING_PROVIDER_TOKENS.AGENT_PRICING) private pricing: Model<AgentPricing>,
    // Note: We'll inject AgentsService if needed, but for now we'll use the pricing collection
    // as a proxy for agent existence
  ) {}

  /**
   * Validate that an agent exists and has pricing configured
   * @param agent_id The agent ID to validate
   * @returns AgentValidationResult with validation status
   */
  async validateAgent(agent_id: string): Promise<AgentValidationResult> {
    try {
      // Check if agent has pricing configured (this implies the agent exists)
      const pricing = await this.pricing.findOne({ agent_id }).sort({ version: -1 }).lean();
      
      if (!pricing) {
        return {
          isValid: false,
          reason: `Agent ${agent_id} not found or has no pricing configured`,
          agent_id
        };
      }

      // Validate pricing configuration
      if (!pricing.fixed_per_min_rate || pricing.fixed_per_min_rate <= 0) {
        return {
          isValid: false,
          reason: `Agent ${agent_id} has invalid pricing configuration (fixed_per_min_rate must be > 0)`,
          agent_id,
          pricing_version: pricing.version
        };
      }

      // Additional validation could be added here:
      // - Check if agent is active/enabled (would require AgentsService)
      // - Check if agent is within usage limits
      // - Check if agent has valid KPI configuration
      
      return {
        isValid: true,
        agent_id,
        pricing_version: pricing.version,
        agent_status: 'active' // Assuming active if pricing exists
      };
    } catch (error) {
      return {
        isValid: false,
        reason: `Error validating agent: ${error.message}`,
        agent_id
      };
    }
  }

  /**
   * Check if multiple agents are valid
   * @param agent_ids Array of agent IDs to validate
   * @returns Array of validation results
   */
  async validateMultipleAgents(agent_ids: string[]): Promise<AgentValidationResult[]> {
    const results: AgentValidationResult[] = [];
    
    for (const agent_id of agent_ids) {
      const result = await this.validateAgent(agent_id);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Get validation statistics
   * @returns Object with validation counts
   */
  async getValidationStats(): Promise<{
    total_agents: number;
    valid_agents: number;
    invalid_agents: number;
  }> {
    const totalAgents = await this.pricing.distinct('agent_id').countDocuments();
    
    // This is a simplified approach - in a real system you might want to check
    // against an actual agents collection to get more accurate stats
    return {
      total_agents: totalAgents,
      valid_agents: totalAgents, // All agents with pricing are considered valid
      invalid_agents: 0
    };
  }

  /**
   * Check if an agent has valid KPI configuration
   * @param agent_id The agent ID to check
   * @returns boolean indicating if KPI configuration is valid
   */
  async hasValidKpiConfiguration(agent_id: string): Promise<boolean> {
    try {
      const pricing = await this.pricing.findOne({ agent_id }).sort({ version: -1 }).lean();
      
      if (!pricing || !pricing.kpi_rates) {
        return false;
      }

      // Check if KPI rates are properly configured
      return pricing.kpi_rates.every(kpi => 
        kpi.kpi_key && 
        typeof kpi.unit_cost === 'number' && 
        kpi.unit_cost > 0
      );
    } catch (error) {
      return false;
    }
  }
}
