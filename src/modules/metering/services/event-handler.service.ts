import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { UsageEvent } from '../schemas/usage-event.schema';
import { DailyAgentUsage } from '../schemas/daily-agent-usage.schema';
import { AgentPricing } from '../schemas/agent-pricing.schema';
import { METERING_PROVIDER_TOKENS } from '../metering.model';

function dateKey(d: Date) { return d.toISOString().slice(0,10); }

@Injectable()
export class EventHandlerService {
  constructor(
    @Inject(METERING_PROVIDER_TOKENS.USAGE_EVENT) private usage: Model<UsageEvent>,
    @Inject(METERING_PROVIDER_TOKENS.DAILY_AGENT_USAGE) private daily: Model<DailyAgentUsage>,
    @Inject(METERING_PROVIDER_TOKENS.AGENT_PRICING) private pricing: Model<AgentPricing>,
  ) {}

  async handle(evt: any, trace_id?: string) {
    const now = new Date();
    const today = dateKey(now);
    const { event_type, agent_id, execution_id } = evt;

    // store raw usage event
    await this.usage.create({
      ts: now,
      agent_id,
      execution_id,
      event_type,
      tool_key: evt.tool_key, // harmless if sent; not billed
      kpi_key: evt.kpi_key,
      value: evt.value,
      unit: evt.unit,
      duration_ms: evt.duration_ms,
      ram_gb: evt.ram_gb,
      tokens_in: evt.metrics?.tokens_in ?? evt.tokens_in,
      tokens_out: evt.metrics?.tokens_out ?? evt.tokens_out,
      metadata: evt.meta || evt.metadata,
      idempotency_key: evt.idempotency_key
    });

    // rollups
    const $inc: any = {};
    if (event_type === 'job.completed') {
      const minutes = Math.max(0, (evt.duration_ms || 0) / 60000);
      $inc['totals.runtime_minutes'] = minutes;
    }
    if (event_type === 'kpi.recorded' && evt.kpi_key && typeof evt.value === 'number') {
      $inc[`totals.kpis.${evt.kpi_key}`] = evt.value;
    }

    const update: any = Object.keys($inc).length ? { $inc } : { $setOnInsert: { totals: {} } };
    await this.daily.findOneAndUpdate({ agent_id, date: today }, update, { upsert: true, new: true }).lean();

    // get current pricing version for echo
    const price = await this.pricing.findOne({ agent_id }).sort({ version: -1 }).lean();

    console.log('Event processed (simple pricing)', {
      trace_id,
      agent_id,
      execution_id,
      event_type,
      date: today,
      pricing_version: price?.version
    });

    return price; // may be undefined if not set yet
  }
}
