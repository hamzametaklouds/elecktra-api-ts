import { Schema } from 'mongoose';
import { TOOLS_COLLECTION } from './tools.constants';

export interface ITool {
  _id?: Schema.Types.ObjectId;
  key: string;
  title: string;
  description: string;
  icon_url: string;
  category: string;
  enabled: boolean;
  oauth_type?: string;
  scopes?: string[];
  config_schema?: any;
  is_deleted: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export const ToolSchema = new Schema<ITool>(
  {
    key: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon_url: {
      type: String,
      required: false,
      default: ''
    },
    category: {
      type: String,
      required: true
    },
    enabled: {
      type: Boolean,
      default: true
    },
    oauth_type: {
      type: String,
      required: false
    },
    scopes: {
      type: [String],
      default: []
    },
    config_schema: {
      type: Schema.Types.Mixed,
      required: false
    },
    is_deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    collection: TOOLS_COLLECTION,
  }
);

// Indexes
ToolSchema.index({ key: 1 }, { 
  unique: true, 
  partialFilterExpression: { is_deleted: false } 
});
ToolSchema.index({ enabled: 1 });
ToolSchema.index({ category: 1 });
ToolSchema.index({ 
  title: 'text', 
  description: 'text' 
});

ToolSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
  this.lean();
});