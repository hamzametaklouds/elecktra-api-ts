import { Schema } from 'mongoose';
import { AGENT_REQUESTS_COLLECTION } from './agent-requests.constants';
import { AgentRequestStatus } from './agent-requests.constants';
import { COMPANY_COLLECTION } from 'src/company/company.constants';
import { USERS_COLLECTION } from 'src/users/users.constants';

interface IWorkflowRequest {
  _id: Schema.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  weeks: number;
  installation_price: number;
  integrations: {
    _id: Schema.Types.ObjectId;
    title: string;
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
}

export interface IAgentRequest {
  _id?: Schema.Types.ObjectId;
  agent_id: Schema.Types.ObjectId;
  title: string;
  description: string;
  display_description: string;
  service_type?: string;
  delivery_date?: Date;
  image: string;
  agent_assistant_id?: string;
  company_id: Schema.Types.ObjectId;
  company_owner_id: Schema.Types.ObjectId;
  status: AgentRequestStatus;
  pricing: IPricing;
  work_flows: IWorkflowRequest[];
  invoice: IInvoice;
  created_by?: Schema.Types.ObjectId;
  updated_by?: Schema.Types.ObjectId;
  is_disabled?: boolean;
  is_deleted?: boolean;
}

const WorkflowRequestSchema = new Schema<IWorkflowRequest>({
  _id: {
    type: Schema.Types.ObjectId,
    required: true
  },
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
  weeks: {
    type: Number,
    required: true
  },
  installation_price: {
    type: Number,
    required: true
  },
  integrations: [{
    _id: {
      type: Schema.Types.ObjectId,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  }]
});

const InvoiceSchema = new Schema<IInvoice>({
  workflows_total: {
    type: Number,
    required: true
  },
  workflows_installation_total: {
    type: Number,
    required: true
  },
  installation_price: {
    type: Number,
    required: true
  },
  subscription_price: {
    type: Number,
    required: true
  },
  grand_total: {
    type: Number,
    required: true
  }
});

export const AgentRequestSchema = new Schema<IAgentRequest>(
  {
    agent_id: {
      type: Schema.Types.ObjectId,
      ref: 'agents',
      required: true
    },
    title: {
      type: String,
      required: true
    },
  
    service_type: {
      type: String,
      required: false
    },
  
    description: {
      type: String,
      required: true
    },
    agent_assistant_id: {
      type: String,
      required: false
    },
    company_id: {
        type: Schema.Types.ObjectId,
        ref: COMPANY_COLLECTION,
        required: false
      },
    company_owner_id: {
        type: Schema.Types.ObjectId,
        ref: USERS_COLLECTION,
        required: false
      },
    display_description: {
      type: String,
      required: true
    },

    delivery_date: {
      type: Date,
      required: false
    },
    image: {
      type: String,
      required: false,
      default: ''
    },
    status: {
      type: String,
      enum: AgentRequestStatus,
      default: AgentRequestStatus.SUBMITTED,
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
    work_flows: [WorkflowRequestSchema],
    invoice: InvoiceSchema,
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
    collection: AGENT_REQUESTS_COLLECTION,
  }
);

AgentRequestSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
  this.lean();
}); 