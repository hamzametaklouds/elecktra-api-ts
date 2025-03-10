import { Schema } from 'mongoose';
import { SYSTEM_USERS_COLLECTION } from './system-users.constant';
import { UserRoles } from 'src/app/global-enums';
import { Role } from 'src/roles/roles.schema';

export interface ISystemUsers {
  _id?: Schema.Types.ObjectId;
  image: string;
  first_name: string;
  last_name: string;
  email: string;
  country_code: string;
  phone_no: string;
  password: string;
  roles: string[];
  email_verified: boolean;
  email_verified_at: Date;
  phone_verified: boolean;
  phone_verifed_at: Date;
  created_by?: Schema.Types.ObjectId;
  updated_by?: Schema.Types.ObjectId;
  is_disabled?: boolean;
  is_deleted?: boolean;
}

export const SystemUsersSchema = new Schema<ISystemUsers>(
  {
    image: {
      type: String,
      required: false,
      default: ''
    },
    first_name: {
      type: String,
      required: false,
      default: ''
    },
    last_name: {
      type: String,
      required: false,
      default: ''
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
    password: {
      type: String,
      required: false,
      default: null
    },
    email_verified: {
      type: Boolean,
      required: false,
      default: false
    },
    roles: {
      type: [String],
      required: false,
      enum: Role,
      default: null
    },
    email_verified_at: {
      type: Date,
      required: false,
      default: new Date()
    },
    phone_verified: {
      type: Boolean,
      required: false,
      default: false
    },
    phone_verifed_at: {
      type: Date,
      required: false,
      default: new Date()
    },
    is_disabled: {
      type: Boolean,
      required: false,
      default: true,
    },
    is_deleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: SYSTEM_USERS_COLLECTION,
    },
    updated_by: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: SYSTEM_USERS_COLLECTION,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    collection: SYSTEM_USERS_COLLECTION,
  }
);

SystemUsersSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
  this.lean();
});
