import { Schema } from 'mongoose';
import { USERS_COLLECTION } from './users.constants';
import { Role } from 'src/roles/roles.schema';
import { INVITATIONS_COLLECTION } from 'src/invitations/invitations.constants';
import { COMPANY_COLLECTION } from 'src/company/company.constants';


export interface IUsers {
  _id?: Schema.Types.ObjectId;
  image: string;
  first_name: string;
  last_name: string;
  email: string;
  business_name: string;
  country_code: string;
  password: string;
  phone_no: string;
  roles: string[];
  gender?: string
  address: string;
  emergency_contact?: string;
  country?: string
  biography?: string
  street?: string
  apple_id: string;
  city?: string
  post_code?: string
  dob: string;
  email_verified?: boolean;
  email_verified_at?: Date;
  uuid: string;
  invitation_id?: Schema.Types.ObjectId;
  created_by?: Schema.Types.ObjectId;
  updated_by?: Schema.Types.ObjectId;
  is_disabled?: boolean;
  is_deleted?: boolean;
  company_id?: Schema.Types.ObjectId;
}

export const UsersSchema = new Schema<IUsers>(
  {
    image: {
      type: String,
      required: false,
      default: ''
    },
    apple_id: {
      type: String,
      required: false,
      default: ''
    },
    business_name: {
      type: String,
      required: false,
      default: null
    },
    last_name: {
      type: String,
      required: false,
      default: null
    },
    first_name: {
      type: String,
      required: false,
      default: ''
    },
    biography: {
      type: String,
      required: false,
      default: ''
    },
    roles: {
      type: [String],
      required: false,
      enum: Role,
      default: [Role.BUSINESS_OWNER]
    },
    email: {
      type: String,
      required: false,
      default: ''
    },
    email_verified: {
      type: Boolean,
      required: false,
      default: false
    },
    email_verified_at: {  
      type: Date,
      required: false,
      default: null
    },
    password: {
      type: String,
      required: false,
      default: ''
    },
    country_code: {
      type: String,
      required: false,
      default: ''
    },
    phone_no: {
      type: String,
      required: false,
      default: ''
    },
    gender: {
      type: String,
      required: false,
      default: ''
    },
    emergency_contact: {
      type: String,
      required: false,
      default: ''
    },
    country: {
      type: String,
      required: false,
      default: ''
    },
    street: {
      type: String,
      required: false,
      default: ''
    },
    city: {
      type: String,
      required: false,
      default: ''
    },
    post_code: {
      type: String,
      required: false,
      default: ''
    },
    dob: {
      type: String,
      required: false,
      default: ''
    },
    uuid: {
      type: String,
      required: false,
      default: ''
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
    invitation_id: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: INVITATIONS_COLLECTION,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: USERS_COLLECTION,
    },
    updated_by: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: USERS_COLLECTION,
    },
    company_id: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: COMPANY_COLLECTION,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    collection: USERS_COLLECTION,
  }
);

UsersSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
  this.lean();
});
