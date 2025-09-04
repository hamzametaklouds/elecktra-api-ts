import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'agent_pricing' })
export class AgentPricing {
  @Prop({ index: true }) agent_id: string;     // public agent id
  @Prop({ default: 'v1', index: true }) version: string;
  @Prop({ required: true }) fixed_per_min_rate: number; // e.g., 0.02 USD per minute
  @Prop({ 
    type: [{
      kpi_key: { type: String, required: true },
      unit_cost: { type: Number, required: true },
      unit: { type: String, required: false }
    }], 
    default: [] 
  }) kpi_rates: Array<{
    kpi_key: string;
    unit_cost: number;
    unit?: string;
  }>;
  @Prop({ default: () => new Date() }) created_at: Date;
  @Prop({ default: () => new Date() }) updated_at: Date;
}
export const AgentPricingSchema = SchemaFactory.createForClass(AgentPricing);
AgentPricingSchema.index({ agent_id: 1, version: -1 }, { unique: true });
