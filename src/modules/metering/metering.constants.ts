export const METERING_COLLECTIONS = {
  AGENT_PRICING: 'agent_pricing',
  KPI_REGISTRY: 'agent_kpi_registry',
  USAGE_EVENTS: 'usage_events',
  DAILY_AGENT_USAGE: 'daily_agent_usage',
  INVOICES: 'invoices',
} as const;

export const EVENT_TYPES = {
  JOB_COMPLETED: 'job.completed',
  KPI_RECORDED: 'kpi.recorded',
  TOOL_USED: 'tool.used',
} as const;

export const WEBHOOK_HEADERS = {
  AGENT_ID: 'x-agent-id',
  TIMESTAMP: 'x-timestamp',
  IDEMPOTENCY_KEY: 'x-idempotency-key',
  SIGNATURE: 'x-signature',
} as const;
