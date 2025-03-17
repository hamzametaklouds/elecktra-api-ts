import { Schema } from 'mongoose';
import { AGENTS_COLLECTION } from './agents.constants';

export enum AgentStatus {
  ACTIVE = 'Active',
  MAINTENANCE = 'Maintenance',
  TERMINATED = 'Terminated'
}

interface IWorkflow {
 _id?: Schema.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  is_disabled: boolean;
  integrations: Schema.Types.ObjectId[];
}

interface IPricing {
  installation_price: number;
  subscription_price: number;
}

export interface IAgent {
  _id?: Schema.Types.ObjectId;
  title: string;
  sub_title: string;
  description: string;
  display_description: string;
  request_time_frame: string;
  image: string;
  status: AgentStatus;
  pricing: IPricing;
  work_flows: IWorkflow[];
  created_by?: Schema.Types.ObjectId;
  updated_by?: Schema.Types.ObjectId;
  is_disabled?: boolean;
  is_deleted?: boolean;
}

const WorkflowSchema = new Schema<IWorkflow>({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  is_disabled: {
    type: Boolean,
    default: false
  },
  integrations: [{
    type: Schema.Types.ObjectId,
    ref: 'integrations' // Reference to your integrations collection
  }]
});

export const AgentSchema = new Schema<IAgent>(
  {
    title: {
      type: String,
      required: true
    },
    sub_title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    display_description: {
      type: String,
      required: true
    },
    request_time_frame: {
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
      default: AgentStatus.ACTIVE,
      required: true
    },
    pricing: {
      installation_price: {
        type: Number,
        required: true
      },
      subscription_price: {
        type: Number,
        required: true
      }
    },
    work_flows: [WorkflowSchema],
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: false
    },
    updated_by: {
      type: Schema.Types.ObjectId,
      ref: 'users',
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

AgentSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
  this.lean();
}); 