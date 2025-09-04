import { Schema } from 'mongoose';
import { AGENTS_COLLECTION } from './agents.constants';
import { INTEGRATIONS_COLLECTION } from 'src/integrations/integrations.constants';
import { COMPANY_COLLECTION } from 'src/company/company.constants';
import { USERS_COLLECTION } from 'src/users/users.constants';

export enum AgentStatus {
  DRAFT = 'Draft',
  ACTIVE = 'Active', 
  PAUSED = 'Paused',
  SUSPENDED = 'Suspended',
  MAINTENANCE = 'Maintenance',
  TERMINATED = 'Terminated'
}

export interface IPricing {
  installation_price?: number;
  subscription_price?: number;
}

export interface IAgent {
  _id?: Schema.Types.ObjectId;
  title: string;
  description: string;
  display_description: string;
  service_type: string;
  assistant_id: string;
  image: string;
  status: AgentStatus;
  pricing: IPricing;
  company_id?: Schema.Types.ObjectId;
  normalized_title: string;
  tags: Schema.Types.ObjectId[];
  client_id?: Schema.Types.ObjectId;
  client_name?: string;
  tools_selected: Schema.Types.ObjectId[];
  tools_count?: number;
  created_by?: Schema.Types.ObjectId;
  updated_by?: Schema.Types.ObjectId;
  is_disabled?: boolean;
  is_deleted?: boolean;
}


export const AgentSchema = new Schema<IAgent>(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    assistant_id: {
      type: String,
      required: false
    },
    display_description: {
      type: String,
      required: true
    },
   
    image: {
      type: String,
      required: false,
      default: ''
    },
    status: {
      type: String,
      enum: AgentStatus,
      default: AgentStatus.DRAFT,
      required: true
    },
    service_type: {
      type: String,
      required: true
    },
    pricing: {
      installation_price: {
        type: Number,
        required: false
      },
      subscription_price: {
        type: Number,
        required: false
      }
    },
    company_id: {
      type: Schema.Types.ObjectId,
      ref: COMPANY_COLLECTION,
      required: false
    },
    normalized_title: {
      type: String,
      required: false
    },
    tags: {
      type: [Schema.Types.ObjectId],
      ref: 'tags',
      default: [],
      validate: {
        validator: function(v: Schema.Types.ObjectId[]) {
          return v.length <= 5;
        },
        message: 'Tags array cannot exceed 5 items'
      }
    },
    client_id: {
      type: Schema.Types.ObjectId,
      ref: USERS_COLLECTION,
      required: false
    },
    client_name: {
      type: String,
      required: false
    },
    tools_selected: {
      type: [Schema.Types.ObjectId],
      ref: 'tools',
      default: [],
      validate: {
        validator: function(v: Schema.Types.ObjectId[]) {
          return v.length <= 24;
        },
        message: 'Tools selected cannot exceed 24 items'
      }
    },
    tools_count: {
      type: Number,
      default: 0
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: USERS_COLLECTION,
      required: false
    },
    updated_by: {
      type: Schema.Types.ObjectId,
      ref: USERS_COLLECTION,
      required: false
    },
    is_disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    is_deleted: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    collection: AGENTS_COLLECTION,
  }
);

// Indexes
AgentSchema.index({ company_id: 1, normalized_title: 1 }, { 
  unique: true, 
  partialFilterExpression: { is_deleted: false } 
});
AgentSchema.index({ status: 1 });
AgentSchema.index({ tags: 1 });
AgentSchema.index({ created_at: -1 });
AgentSchema.index({ tools_selected: 1 });
AgentSchema.index({ 
  title: 'text', 
  description: 'text', 
  display_description: 'text' 
});

// Pre-save hook to sanitize data
AgentSchema.pre('save', function(next) {
  // Always set normalized_title from title
  this.normalized_title = (this.title || '').toLowerCase().trim();
  
  if (this.tags && this.tags.length > 0) {
    // Dedupe and limit to 5
    const uniqueTags = Array.from(new Set(
      this.tags.map(tag => tag.toString())
    )).slice(0, 5);
    this.tags = uniqueTags.map(id => new Schema.Types.ObjectId(id));
  }
  
  // Set tools_count based on tools_selected length
  if (this.tools_selected && this.tools_selected.length > 0) {
    this.tools_count = this.tools_selected.length;
  } else {
    this.tools_count = 0;
  }
  
  next();
});

AgentSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  
  // Always set normalized_title from title if title is being updated
  if (update.title) {
    update.normalized_title = update.title.toLowerCase().trim();
  }
  
  if (update.tags && update.tags.length > 0) {
    const uniqueTags = Array.from(new Set(
      update.tags.map(tag => tag.toUpperCase().trim())
    )).slice(0, 5);
    update.tags = uniqueTags;
  }
  
  if (update.tools_selected !== undefined) {
    update.tools_count = update.tools_selected.length || 0;
  }
  
  next();
});

AgentSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
  this.lean();
}); 