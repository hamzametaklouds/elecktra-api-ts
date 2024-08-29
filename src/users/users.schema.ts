import { Schema } from 'mongoose';
import { SYSTEM_USERS_COLLECTION } from 'src/system-users/system-users.constant';
import { USERS_COLLECTION } from './users.constants';

export interface IEmergencyContact {
  phone_no: string;
  relationship: string;
  name: string;
  address:string;
}

export const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    phone_no: {
      type: String,
      required: true,
      default:''
    },
    relationship: {
      type: String,
      required: true,
      default:''
    },
    name: {
      type: String,
      required: true,
      default:''
    },
    address: {
      type: String,
      required: true,
      default:''
    },
  }
);

export interface IUsers {
  _id?: Schema.Types.ObjectId;
  image: string;
  first_name: string;
  sur_name: string;
  email: string;
  phone_no: string;
  password: string;
  email_verified:boolean;
  email_verified_at: Date;
  finger_print_enabled: boolean;
  fcm_token?: string;
  emergency_contacts?: IEmergencyContact[]
  updated_by?: Schema.Types.ObjectId;
  is_disabled?: boolean;
  is_deleted?: boolean;
}

export const UsersSchema = new Schema<IUsers>(
  {
    image: {
      type: String,
      required: false,
      default:''
    },
    first_name: {
      type: String,
      required: false,
      default:''
    },
    sur_name: {
      type: String,
      required: false,
      default:''
    },
    email: {
        type: String,
        required: false,
        default:''
      },
    emergency_contacts:{
      type: [EmergencyContactSchema],
        required: false,
        default:[]
    },
    phone_no: {
        type: String,
        required: false,
        default:''
      },
    fcm_token:{
      type: String,
        required: false,
        default:''
      },
    password: {
        type: String,
        required: false,
        default:null
      },
    email_verified: {
        type: Boolean,
        required: false,
        default:false
      },
    email_verified_at: {
        type: Date,
        required: false,
        default:new Date()
      },
    finger_print_enabled:{
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
    collection: USERS_COLLECTION,
  }
);

UsersSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
  this.lean();
});
