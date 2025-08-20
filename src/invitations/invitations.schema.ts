import { Schema } from 'mongoose';
import { INVITATIONS_COLLECTION } from './invitations.constants';
import { Role } from 'src/roles/roles.schema';
import { USERS_COLLECTION } from 'src/users/users.constants';
import { COMPANY_COLLECTION } from 'src/company/company.constants';
import { AGENTS_COLLECTION } from 'src/agents/agents.constants';

export enum InvitationStatus {
  P = 'Pending',
  O = 'Opened',
  A = 'Accepted',
  D = 'Discarded',
}

export interface IInvitations {
  _id?: Schema.Types.ObjectId;
  role: string;
  email: string;
  link_id: string;
  token: string;
  created_by?: Schema.Types.ObjectId;
  company_id?: Schema.Types.ObjectId;
  agent_id?: Schema.Types.ObjectId;
  invitee_name?: string;
  invitation_status: string;
  is_used?: boolean;
  is_disabled?: boolean;
  is_deleted?: boolean;
  is_forget_password?: boolean;
  expires_at?: Date;
  opened_at?: Date;
  accepted_at?: Date;
  discarded_at?: Date;
  notes?: string;
  created_at: Date;
  updated_at?: Date;
}

export const InvitationsSchema = new Schema<IInvitations>(
  {
    // first_name: {
    //   type: String,
    //   required: false,
    // },
    email: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: false,
      enum: Role,
      default: null

    },
    link_id: {
      type: String,
      required: false,
    },
    token: {
      type: String,
      required: false,
    },
    company_id: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: COMPANY_COLLECTION,
    },
    agent_id: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: AGENTS_COLLECTION,
    },
    invitee_name: {
      type: String,
      required: false,
    },
    invitation_status: {
      type: String,
      required: false,
      enum: InvitationStatus,
      default: InvitationStatus.P
    },
    is_used: {
      type: Boolean,
      required: false,
      default: false,
    },
    is_disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    is_forget_password: {
      type: Boolean,
      required: false,
      default: false,
    },
    expires_at: {
      type: Date,
      required: false,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    opened_at: {
      type: Date,
      required: false,
    },
    accepted_at: {
      type: Date,
      required: false,
    },
    discarded_at: {
      type: Date,
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: USERS_COLLECTION,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    collection: INVITATIONS_COLLECTION,
  }
);

// Indexes for efficient querying and de-duplication
InvitationsSchema.index({ email: 1, company_id: 1, is_used: 1, invitation_status: 1 });
InvitationsSchema.index({ agent_id: 1 });
InvitationsSchema.index({ link_id: 1 }, { unique: true });
InvitationsSchema.index({ expires_at: 1 });
InvitationsSchema.index({ created_at: -1 });

InvitationsSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
  this.lean();
});
