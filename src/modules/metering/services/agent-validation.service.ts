import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Model, Types } from 'mongoose';
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
      // First, check if agent exists in the agents collection
      const mongoose = require('mongoose');
      const db = mongoose.connection.db;
      const agent = await db.collection('agents').findOne({ 
        _id: new Types.ObjectId(agent_id),
        is_deleted: false 
      });

      console.log('agent', agent);
      
      if (!agent) {
        return {
          isValid: false,
          reason: `Agent ${agent_id} not found`,
          agent_id
        };
      }

      // Check if agent has pricing configured in the agents collection
      if (!agent.pricing || (agent.pricing.installation_price === undefined && agent.pricing.subscription_price === undefined)) {
        return {
          isValid: false,
          reason: `Agent ${agent_id} has no pricing configured`,
          agent_id
        };
      }

      // Validate that at least one pricing field has a valid value
      const hasValidPricing = (agent.pricing.installation_price !== undefined && agent.pricing.installation_price >= 0) ||
                             (agent.pricing.subscription_price !== undefined && agent.pricing.subscription_price >= 0);

      if (!hasValidPricing) {
        return {
          isValid: false,
          reason: `Agent ${agent_id} has invalid pricing configuration`,
          agent_id
        };
      }

      // Additional validation could be added here:
      // - Check if agent is active/enabled
      // - Check if agent is within usage limits
      // - Check if agent has valid KPI configuration
      
      return {
        isValid: true,
        agent_id,
        pricing_version: '1.0', // Default version for agent pricing
        agent_status: agent.status || 'active'
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
      // For now, we'll consider agents with basic pricing as having valid KPI configuration
      // In the future, this could be extended to check for specific KPI rates
      const mongoose = require('mongoose');
      const db = mongoose.connection.db;
      const agent = await db.collection('agents').findOne({ 
        _id: new Types.ObjectId(agent_id),
        is_deleted: false 
      });
      
      if (!agent || !agent.pricing) {
        return false;
      }

      // Check if agent has valid pricing configuration
      const hasValidPricing = (agent.pricing.installation_price !== undefined && agent.pricing.installation_price >= 0) ||
                             (agent.pricing.subscription_price !== undefined && agent.pricing.subscription_price >= 0);

      return hasValidPricing;
    } catch (error) {
      return false;
    }
  }
}
