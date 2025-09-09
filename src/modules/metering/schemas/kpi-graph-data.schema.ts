import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'kpi_graph_data' })
export class KpiGraphData {
  @Prop({ type: Types.ObjectId, ref: 'Agent', index: true }) agent_id: Types.ObjectId;
  @Prop({ type: String, required: true, index: true }) kpi_key: string;
  @Prop({ 
    type: [{
      x: { type: String, required: true }, // x-axis value (usually timestamp or category)
      y: { type: Number, required: true }, // y-axis value (the actual KPI value)
      label: { type: String, required: false } // optional label for the data point
    }], 
    default: [] 
  }) data_points: Array<{
    x: string;
    y: number;
    label?: string;
  }>;
  @Prop({ default: () => new Date() }) created_at: Date;
  @Prop({ default: () => new Date() }) updated_at: Date;
}

export const KpiGraphDataSchema = SchemaFactory.createForClass(KpiGraphData);
KpiGraphDataSchema.index({ agent_id: 1, kpi_key: 1 }, { unique: true });
