import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { UsageEvent } from '../schemas/usage-event.schema';
import { DailyAgentUsage } from '../schemas/daily-agent-usage.schema';
import { AgentPricing } from '../schemas/agent-pricing.schema';
import { KpiRegistry } from '../schemas/kpi-registry.schema';
import { KpiType } from '../enums/kpi-type.enum';
import { METERING_PROVIDER_TOKENS } from '../metering.model';

function dateKey(d: Date) { return d.toISOString().slice(0,10); }

import { IEventHandlerService } from '../interfaces/event-handler.interface';

@Injectable()
export class EventHandlerService implements IEventHandlerService {
  constructor(
    @Inject(METERING_PROVIDER_TOKENS.USAGE_EVENT) private usage: Model<UsageEvent>,
    @Inject(METERING_PROVIDER_TOKENS.DAILY_AGENT_USAGE) private daily: Model<DailyAgentUsage>,
    @Inject(METERING_PROVIDER_TOKENS.AGENT_PRICING) private pricing: Model<AgentPricing>,
    @Inject(METERING_PROVIDER_TOKENS.KPI_REGISTRY) private kpiRegistry: Model<KpiRegistry>,
  ) {}

  /**
   * Get KPI type from registry
   * @param agent_id Agent ID
   * @param kpi_key KPI key
   * @returns KPI configuration or undefined if not found
   */
  public async getKpiType(agent_id: string, kpi_key: string): Promise<{ key: string; type: KpiType; graph_type?: GraphType } | undefined> {
    const registry = await this.kpiRegistry.findOne({ agent_id });
    return registry?.kpis.find(k => k.key === String(kpi_key));
  }

  async handle(evt: any, trace_id?: string) {
    const now = new Date();
    const today = dateKey(now);
    const { event_type, agent_id, execution_id } = evt;

    try {
      // Handle idempotency - if duplicate key error, treat as success
      await this.usage.create({
        ts: now,
        agent_id,
        execution_id: execution_id || `exec_${Date.now()}`, // Generate execution_id if not provided
        event_type,
        tool_key: evt.tool_key, // harmless if sent; not billed
        kpi_key: evt.kpi_key ? String(evt.kpi_key) : undefined, // Convert to string
        value: evt.value,
        unit: evt.unit,
        duration_ms: evt.duration_ms,
        ram_gb: evt.ram_gb,
        tokens_in: evt.metrics?.tokens_in ?? evt.tokens_in,
        tokens_out: evt.metrics?.tokens_out ?? evt.tokens_out,
        metadata: evt.meta || evt.metadata,
        idempotency_key: evt.idempotency_key
      });
    } catch (error) {
      // If duplicate key error on idempotency_key, treat as idempotent success
      if (error.code === 11000 && error.keyPattern?.idempotency_key) {
        console.log('Idempotent event detected, returning success', { trace_id, agent_id, event_type });
        return { status: 'ok' };
      }
      throw error;
    }

    // Handle different event types according to specification
    const $inc: any = {};
    
    if (event_type === 'execution.completed') {
      // Compute runtime minutes from execution.started to execution.completed
      const minutes = await this.computeRuntimeMinutes(agent_id, now);
      if (minutes > 0) {
        $inc['totals.runtime_minutes'] = minutes;
      }
    }
    
    if (event_type === 'job.started' && evt.kpi_key) {
      // Get KPI type from registry
      const registry = await this.kpiRegistry.findOne({ agent_id });
      const kpi = registry?.kpis.find(k => k.key === String(evt.kpi_key));

      if (!kpi) {
        console.warn('KPI not found in registry', { agent_id, kpi_key: evt.kpi_key });
        return { status: 'error', message: 'KPI not found' };
      }

      // Handle based on KPI type
      if (kpi.type === KpiType.COUNT) {
        // For count type, just store the value
        if (typeof evt.value === 'number') {
          $inc[`totals.kpis.${evt.kpi_key}`] = evt.value;
        }
      } else if (kpi.type === KpiType.GRAPH) {
        // For graph type, store the data point with date_time and events
        if (evt.date_time && typeof evt.events === 'number') {
          await this.usage.create({
            ts: now,
            agent_id,
            execution_id,
            event_type,
            kpi_key: String(evt.kpi_key),
            value: evt.events,
            metadata: {
              date_time: evt.date_time,
              x_value: evt.date_time,
              y_value: evt.events
            }
          });
        }
      }

      console.log('Job started event processed', {
        trace_id,
        agent_id,
        kpi_key: evt.kpi_key,
        execution_id,
        kpi_type: kpi.type
      });
    }
    
    if (event_type === 'job.completed' && evt.kpi_key) {
      // Get KPI type from registry
      const registry = await this.kpiRegistry.findOne({ agent_id });
      const kpi = registry?.kpis.find(k => k.key === String(evt.kpi_key));

      if (!kpi) {
        console.warn('KPI not found in registry', { agent_id, kpi_key: evt.kpi_key });
        return { status: 'error', message: 'KPI not found' };
      }

      // Handle based on KPI type
      if (kpi.type === KpiType.COUNT && typeof evt.value === 'number') {
        // For count type, increment the total
        const kpiKey = String(evt.kpi_key);
        $inc[`totals.kpis.${kpiKey}`] = evt.value;
      } else if (kpi.type === KpiType.GRAPH) {
        // For graph type, update the graph data
        if (evt.date_time && typeof evt.events === 'number') {
          await this.usage.create({
            ts: now,
            agent_id,
            execution_id,
            event_type,
            kpi_key: String(evt.kpi_key),
            value: evt.events,
            metadata: {
              date_time: evt.date_time,
              x_value: evt.date_time,
              y_value: evt.events
            }
          });
        }
      }
    }

    // Update daily usage if there are increments to make
    if (Object.keys($inc).length > 0) {
      await this.daily.findOneAndUpdate(
        { agent_id, date: today }, 
        { $inc }, 
        { upsert: true, new: true }
      ).lean();
    }

    // get current pricing version for echo
    const price = await this.pricing.findOne({ agent_id }).sort({ version: -1 }).lean();

    console.log('Event processed', {
      trace_id,
      agent_id,
      execution_id,
      event_type,
      date: today,
      pricing_version: price?.version
    });

    return price; // may be undefined if not set yet
  }

  /**
   * Compute runtime minutes for execution.completed events
   * @param agent_id Agent ID
   * @param endTs End timestamp (now)
   * @returns Runtime in minutes
   */
  /**
   * Get KPI type from registry
   * @param agent_id Agent ID
   * @param kpi_key KPI key
   * @returns KPI configuration or undefined if not found
   */
  public async getKpiType(agent_id: string, kpi_key: string): Promise<{ key: string; type: KpiType; graph_type?: GraphType } | undefined> {
    const registry = await this.kpiRegistry.findOne({ agent_id });
    return registry?.kpis.find(k => k.key === String(kpi_key));
  }

  private async computeRuntimeMinutes(agent_id: string, endTs: Date): Promise<number> {
    try {
      // Find the most recent execution.completed before this one
      const lastCompleted = await this.usage.findOne({
        agent_id,
        event_type: 'execution.completed',
        ts: { $lt: endTs }
      }).sort({ ts: -1 }).lean();

      // Find the most recent execution.started after the last completed (or from beginning)
      const startQuery: any = {
        agent_id,
        event_type: 'execution.started'
      };

      if (lastCompleted) {
        startQuery.ts = { $gt: lastCompleted.ts };
      }

      const start = await this.usage.findOne(startQuery).sort({ ts: 1 }).lean();

      // If no start found, try to find the latest execution.started as fallback
      if (!start) {
        const fallbackStart = await this.usage.findOne({
          agent_id,
          event_type: 'execution.started'
        }).sort({ ts: -1 }).lean();

        if (!fallbackStart) {
          return 0; // No start event found
        }

        const minutes = Math.max(0, (endTs.getTime() - fallbackStart.ts.getTime()) / 60000);
        return minutes;
      }

      const minutes = Math.max(0, (endTs.getTime() - start.ts.getTime()) / 60000);
      return minutes;
    } catch (error) {
      console.error('Error computing runtime minutes:', error);
      return 0;
    }
  }
}
