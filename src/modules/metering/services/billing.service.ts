import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { DailyAgentUsage } from '../schemas/daily-agent-usage.schema';
import { AgentPricing } from '../schemas/agent-pricing.schema';
import { Invoice } from '../schemas/invoice.schema';
import { METERING_PROVIDER_TOKENS } from '../metering.model';

@Injectable()
export class BillingService {
  constructor(
    @Inject(METERING_PROVIDER_TOKENS.DAILY_AGENT_USAGE) private daily: Model<DailyAgentUsage>,
    @Inject(METERING_PROVIDER_TOKENS.AGENT_PRICING) private pricing: Model<AgentPricing>,
    @Inject(METERING_PROVIDER_TOKENS.INVOICE) private invoices: Model<Invoice>,
  ) {}

  /**
   * Compute invoice using the latest pricing version for the agent within [start,end].
   * Price model:
   *  - runtime line = sum(runtime_minutes) * fixed_per_min_rate
   *  - for each KPI key in pricing.kpi_rates: line = sum(kpis[key]) * unit_cost
   */
  async generateInvoice(agent_id: string, period_start: string, period_end: string) {
    const price = await this.pricing.findOne({ agent_id }).sort({ version: -1 }).lean();
    if (!price) throw new Error('No pricing configured for agent');

    const docs = await this.daily.find({
      agent_id,
      date: { $gte: period_start, $lte: period_end }
    }).lean();

    let runtimeMinutes = 0;
    const kpiTotals: Record<string, number> = {};

    for (const d of docs) {
      runtimeMinutes += d.totals?.runtime_minutes || 0;
      const kpis = d.totals?.kpis || {};
      for (const [k, v] of Object.entries(kpis)) {
        kpiTotals[k] = (kpiTotals[k] || 0) + (typeof v === 'number' ? v : 0);
      }
    }

    const lines: any[] = [];

    // Runtime line
    const runtimeAmount = runtimeMinutes * price.fixed_per_min_rate;
    lines.push({
      kind: 'runtime',
      key: 'runtime_minutes',
      unit: 'minute',
      quantity: Number(runtimeMinutes.toFixed(3)),
      unit_cost: price.fixed_per_min_rate,
      amount: Number(runtimeAmount.toFixed(6))
    });

    // KPI lines (only those present in pricing.kpi_rates)
    for (const kr of (price.kpi_rates || [])) {
      const qty = kpiTotals[kr.kpi_key] || 0;
      const amount = qty * kr.unit_cost;
      lines.push({
        kind: 'tool', // keep schema; semantic is KPI
        key: kr.kpi_key,
        unit: kr.unit || 'unit',
        quantity: Number(qty.toFixed(3)),
        unit_cost: kr.unit_cost,
        amount: Number(amount.toFixed(6))
      });
    }

    const subtotal = lines.reduce((a, b) => a + b.amount, 0);
    const tax = 0;
    const total = subtotal + tax;

    const inv = await this.invoices.create({
      agent_id,
      period_start,
      period_end,
      line_items: lines,
      subtotal: Number(subtotal.toFixed(6)),
      tax,
      total: Number(total.toFixed(6)),
      status: 'draft'
    });

    return inv.toObject();
  }
}
