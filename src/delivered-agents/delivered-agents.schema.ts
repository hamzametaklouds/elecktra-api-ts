import { Schema } from 'mongoose';
import { COMPANY_COLLECTION } from 'src/company/company.constants';
import { USERS_COLLECTION } from 'src/users/users.constants';
import { AGENT_REQUESTS_COLLECTION } from 'src/agent-requests/agent-requests.constants';
import { DELIVERED_AGENTS_COLLECTION } from './delivered-agents.constants';

export enum MaintenanceStatus {
  ACTIVE = 'Active',
  MAINTENANCE = 'Under Maintenance',
  TERMINATED = 'Terminated',
  SUBSCRIPTION_CANCELLED = 'Subscription Cancelled'
}

interface IWorkflow {
  _id: Schema.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  weeks: number;
  installation_price: number;
  integrations: {
    _id: Schema.Types.ObjectId;
    title: string;
    description: string;
    image: string;
  }[];
}

interface IPricing {
  installation_price?: number;
  subscription_price?: number;
}

interface IInvoice {
  workflows_total: number;
  workflows_installation_total: number;
  installation_price: number;
  subscription_price: number;
  grand_total: number;
  request_time_frame: number;
}

export interface IDeliveredAgent {
  _id?: Schema.Types.ObjectId;
  agent_request_id: Schema.Types.ObjectId;
  agent_id: Schema.Types.ObjectId;
  title: string;
  description: string;
  display_description: string;
  delivery_date: Date;
  image: string;
  agent_assistant_id: string;
  company_id: Schema.Types.ObjectId;
  company_owner_id: Schema.Types.ObjectId;
  maintenance_status: MaintenanceStatus;
  pricing: IPricing;
  work_flows: IWorkflow[];
  invoice: IInvoice;
  request_time_frame: number;
  created_by?: Schema.Types.ObjectId;
  updated_by?: Schema.Types.ObjectId;
  is_disabled?: boolean;
  is_deleted?: boolean;
}

const WorkflowSchema = new Schema({
  _id: Schema.Types.ObjectId,
  title: String,
  description: String,
  price: Number,
  weeks: Number,
  installation_price: Number,
  integrations: [{
    _id: Schema.Types.ObjectId,
    title: String,
    description: String,
    image: String
  }]
});

const InvoiceSchema = new Schema({
  workflows_total: Number,
  workflows_installation_total: Number,
  installation_price: Number,
  subscription_price: Number,
  grand_total: Number,
  request_time_frame: Number
});

export const DeliveredAgentSchema = new Schema<IDeliveredAgent>({
  agent_request_id: {
    type: Schema.Types.ObjectId,
    ref: AGENT_REQUESTS_COLLECTION,
    required: true
  },
  agent_id: {
    type: Schema.Types.ObjectId,
    ref: 'agents',
    required: true
  },
  title: {
    type: String,
    required: true
  },

  agent_assistant_id: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: true
  },
  display_description: {
    type: String,
    required: true
  },

  delivery_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  image: {
    type: String,
    required: false
  },
  company_id: {
    type: Schema.Types.ObjectId,
    ref: COMPANY_COLLECTION,
    required: true
  },
  company_owner_id: {
    type: Schema.Types.ObjectId,
    ref: USERS_COLLECTION,
    required: true
  },
  maintenance_status: {
    type: String,
    enum: MaintenanceStatus,
    default: MaintenanceStatus.ACTIVE,
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
  work_flows: [WorkflowSchema],
  invoice: InvoiceSchema,
  request_time_frame: {
    type: Number,
    required: true,
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
    default: false
  },
  is_deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  collection: DELIVERED_AGENTS_COLLECTION
});

DeliveredAgentSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
  this.lean();
}); 