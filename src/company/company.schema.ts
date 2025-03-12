import { Schema } from 'mongoose';
import { USERS_COLLECTION } from 'src/users/users.constants';
import { COMPANY_COLLECTION } from './company.constants';

export interface ICompany {
  _id?: Schema.Types.ObjectId;
  name: string;
  website?: string;
  bio?: string;
  image?: string;
  created_by?: Schema.Types.ObjectId;
  is_deleted?: boolean;
  created_at?: Date;
}

export const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      required: false,
    },
    bio: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: USERS_COLLECTION,
      required: false,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
    },
    collection: COMPANY_COLLECTION,
  }
);

CompanySchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
  this.lean();
}); 