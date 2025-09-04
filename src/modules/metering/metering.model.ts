import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { AgentPricingSchema } from './schemas/agent-pricing.schema';
import { KpiRegistrySchema } from './schemas/kpi-registry.schema';
import { UsageEventSchema } from './schemas/usage-event.schema';
import { DailyAgentUsageSchema } from './schemas/daily-agent-usage.schema';
import { InvoiceSchema } from './schemas/invoice.schema';

export const METERING_COLLECTIONS = {
  AGENT_PRICING: 'agent_pricing',
  KPI_REGISTRY: 'agent_kpi_registry',
  USAGE_EVENTS: 'usage_events',
  DAILY_AGENT_USAGE: 'daily_agent_usage',
  INVOICES: 'invoices',
} as const;

export const METERING_PROVIDER_TOKENS = {
  AGENT_PRICING: 'AGENT_PRICING_MODEL',
  KPI_REGISTRY: 'KPI_REGISTRY_MODEL',
  USAGE_EVENT: 'USAGE_EVENT_MODEL',
  DAILY_AGENT_USAGE: 'DAILY_AGENT_USAGE_MODEL',
  INVOICE: 'INVOICE_MODEL',
} as const;

export const MeteringModels = [
  {
    provide: METERING_PROVIDER_TOKENS.AGENT_PRICING,
    useFactory: async (connection: Connection) => 
      connection.model(METERING_COLLECTIONS.AGENT_PRICING, AgentPricingSchema),
    inject: [CONNECTION_PROVIDER],
  },
  {
    provide: METERING_PROVIDER_TOKENS.KPI_REGISTRY,
    useFactory: async (connection: Connection) => 
      connection.model(METERING_COLLECTIONS.KPI_REGISTRY, KpiRegistrySchema),
    inject: [CONNECTION_PROVIDER],
  },
  {
    provide: METERING_PROVIDER_TOKENS.USAGE_EVENT,
    useFactory: async (connection: Connection) => 
      connection.model(METERING_COLLECTIONS.USAGE_EVENTS, UsageEventSchema),
    inject: [CONNECTION_PROVIDER],
  },
  {
    provide: METERING_PROVIDER_TOKENS.DAILY_AGENT_USAGE,
    useFactory: async (connection: Connection) => 
      connection.model(METERING_COLLECTIONS.DAILY_AGENT_USAGE, DailyAgentUsageSchema),
    inject: [CONNECTION_PROVIDER],
  },
  {
    provide: METERING_PROVIDER_TOKENS.INVOICE,
    useFactory: async (connection: Connection) => 
      connection.model(METERING_COLLECTIONS.INVOICES, InvoiceSchema),
    inject: [CONNECTION_PROVIDER],
  },
];
