import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'agent_kpi_registry' })
export class KpiRegistry {
  @Prop({ index: true }) agent_id: string;
  @Prop({ 
    type: [{
      key: { type: String, required: true },
      title: { type: String, required: false },
      unit: { type: String, required: false },
      description: { type: String, required: false }
    }], 
    default: [] 
  }) kpis: Array<{
    key: string;
    title?: string;
    unit?: string;
    description?: string;
  }>;
  @Prop({ default: () => new Date() }) updated_at: Date;
}
export const KpiRegistrySchema = SchemaFactory.createForClass(KpiRegistry);
KpiRegistrySchema.index({ agent_id: 1 }, { unique: true });
