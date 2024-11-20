import { Schema } from 'mongoose';
import { USERS_COLLECTION } from './users.constants';


export enum HostStatus {
  P = 'Pending',
  A = 'Approved',
  R = 'Rejected'
}

export enum HostType {
  S = 'Stay',
  C = 'Car'
}

export interface IUsers {
  _id?: Schema.Types.ObjectId;
  image: string;
  first_name: string;
  last_name: string;
  email: string;
  country_code: string;
  phone_no: string;
  gender?: string
  address: string;
  emergency_contact?: string;
  country?: string
  street?: string
  suite?: string
  is_host: boolean;
  for_stay?: boolean;
  for_car?: boolean;
  host_status: string
  city?: string
  post_code?: string
  dob: string;
  uuid: string;
  created_by?: Schema.Types.ObjectId;
  updated_by?: Schema.Types.ObjectId;
  is_disabled?: boolean;
  is_deleted?: boolean;
}

export const UsersSchema = new Schema<IUsers>(
  {
    image: {
      type: String,
      required: false,
      default: ''
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

    host_status: {
      type: String,
      required: false,
      enum: HostStatus,
      default: HostStatus.P
    },
    email: {
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
    suite: {
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
    is_host: {
      type: Boolean,
      required: false,
      default: false,
    },
    for_stay: {
      type: Boolean,
      required: false,
      default: false,
    },
    for_car: {
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
