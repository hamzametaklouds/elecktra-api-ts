import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { GraphType } from '../enums/graph-type.enum';
import { KpiType } from '../enums/kpi-type.enum';

@Schema({ collection: 'agent_kpi_registry' })
export class KpiRegistry {
  @Prop({ type: Types.ObjectId, ref: 'Agent', index: true }) agent_id: Types.ObjectId;
  @Prop({ 
    type: [{
      key: { type: String, required: true },
      title: { type: String, required: false },
      unit: { type: String, required: false },
      description: { type: String, required: false },
      image: { type: String, required: false },
      type: { type: String, enum: Object.values(KpiType), default: KpiType.IMAGE },
      graph_type: { type: String, enum: Object.values(GraphType), default: GraphType.LINE }
    }], 
    default: [] 
  }) kpis: Array<{
    key: string;
    title?: string;
    unit?: string;
    description?: string;
    image?: string;
    type?: KpiType;
    graph_type?: GraphType;
  }>;
  @Prop({ default: () => new Date() }) updated_at: Date;
}
export const KpiRegistrySchema = SchemaFactory.createForClass(KpiRegistry);
KpiRegistrySchema.index({ agent_id: 1 }, { unique: true });
