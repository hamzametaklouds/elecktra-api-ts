import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { GraphType } from '../enums/graph-type.enum';
import { KpiType } from '../enums/kpi-type.enum';
import { ValueType } from '../enums/value-type.enum';

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
      type: { type: String, enum: Object.values(KpiType), default: KpiType.COUNT },
      graph_type: { type: String, enum: Object.values(GraphType) },
      // Graph type specific fields
      xAxis: {
        name: { type: String },
        type: { type: String }
      },
      yAxis: {
        name: { type: String },
        type: { type: String }
      },
      // Count type specific fields
      name: { type: String },
      value_type: { type: String, enum: Object.values(ValueType) },
      initial_value: { type: Number, default: 0 },
      // Data storage
      data: [{
        name: { type: String },
        value: { type: Number },
        type: { type: String, enum: Object.values(ValueType) },
        timestamp: { type: Date, default: Date.now }
      }],
      // Graph data storage
      graph_data: [{
        xAxis: { type: String },
        yAxis: { type: Number },
        timestamp: { type: Date, default: Date.now }
      }]
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
    xAxis?: { name: string; type: string };
    yAxis?: { name: string; type: string };
    name?: string;
    value_type?: ValueType;
    initial_value?: number;
    data?: Array<{
      name: string;
      value: number;
      type: ValueType;
      timestamp?: Date;
    }>;
    graph_data?: Array<{
      xAxis: string;
      yAxis: number;
      timestamp?: Date;
    }>;
  }>;
  @Prop({ default: () => new Date() }) updated_at: Date;
}
export const KpiRegistrySchema = SchemaFactory.createForClass(KpiRegistry);
KpiRegistrySchema.index({ agent_id: 1 }, { unique: true });
