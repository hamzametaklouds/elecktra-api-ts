import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'invoices' })
export class Invoice {
  @Prop({ index: true }) agent_id: string;
  @Prop() period_start: string; // YYYY-MM-DD format
  @Prop() period_end: string; // YYYY-MM-DD format
  @Prop({ 
    type: [{
      kind: { type: String, enum: ['runtime', 'tool'], required: true },
      key: { type: String, required: true },
      unit: { type: String, required: true },
      quantity: { type: Number, required: true },
      unit_cost: { type: Number, required: true },
      amount: { type: Number, required: true }
    }] 
  }) line_items: Array<{
    kind: 'runtime' | 'tool';
    key: string;
    unit: string;
    quantity: number;
    unit_cost: number;
    amount: number;
  }>;
  @Prop() subtotal: number;
  @Prop() tax: number;
  @Prop() total: number;
  @Prop({ default: 'draft' }) status: string;
  @Prop({ default: () => new Date() }) created_at: Date;
}
export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
InvoiceSchema.index({ agent_id: 1, period_start: 1, period_end: 1 });
