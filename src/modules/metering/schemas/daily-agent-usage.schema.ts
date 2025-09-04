import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'daily_agent_usage' })
export class DailyAgentUsage {
  @Prop({ index: true }) agent_id: string;
  @Prop({ index: true }) date: string; // YYYY-MM-DD format
  @Prop({
    type: {
      runtime_minutes: { type: Number, default: 0 },
      kpis: { type: Object, default: {} } // Record<string, number> - sum of values per kpi_key
    },
    default: {}
  })
  totals: {
    runtime_minutes?: number;
    kpis?: Record<string, number>;
  };
}
export const DailyAgentUsageSchema = SchemaFactory.createForClass(DailyAgentUsage);
DailyAgentUsageSchema.index({ agent_id: 1, date: 1 }, { unique: true });
