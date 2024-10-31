import { Schema } from 'mongoose';
import { SYSTEM_USERS_COLLECTION } from 'src/system-users/system-users.constant';
import { INVITATIONS_COLLECTION } from './invitations.constants';
import { Role } from 'src/roles/roles.schema';
import { COMPANIES_COLLECTION } from 'src/companies/companies.constant';

export enum InvitationStatus {
  P = 'Pending',
  O = 'Opened',
  A = 'Accepted',
}

export interface IInvitations {
  _id?: Schema.Types.ObjectId;
  role: string;
  email: string;
  link_id: string;
  created_by?: Schema.Types.ObjectId;
  company_id?: Schema.Types.ObjectId;
  invitation_status: string;
  is_used?: boolean;
  is_disabled?: boolean;
  is_deleted?: boolean;
  created_at: Date
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
      enum: Role
    },
    link_id: {
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
    company_id: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: COMPANIES_COLLECTION,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: SYSTEM_USERS_COLLECTION,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
    },
    collection: INVITATIONS_COLLECTION,
  }
);

InvitationsSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
  this.lean();
});
