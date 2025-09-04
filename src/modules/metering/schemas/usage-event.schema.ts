import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'usage_events' })
export class UsageEvent {
  @Prop({ index: true }) ts: Date;
  @Prop({ index: true }) agent_id: string;
  @Prop({ index: true }) execution_id: string;
  @Prop() event_type: string;
  @Prop() tool_key?: string; // harmless if sent; not billed
  @Prop() kpi_key?: string;
  @Prop() value?: number;
  @Prop() unit?: string;
  @Prop() duration_ms?: number;
  @Prop() ram_gb?: number;
  @Prop() tokens_in?: number;
  @Prop() tokens_out?: number;
  @Prop({ type: Object }) metadata?: Record<string, any>; // Fixed: specify Mongoose type
  @Prop() idempotency_key?: string;
}
export const UsageEventSchema = SchemaFactory.createForClass(UsageEvent);
UsageEventSchema.index({ agent_id: 1, ts: -1 });
UsageEventSchema.index({ execution_id: 1 });
UsageEventSchema.index({ idempotency_key: 1 }, { unique: true, sparse: true });
