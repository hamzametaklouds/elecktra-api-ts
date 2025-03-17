import { Schema } from 'mongoose';
import { INTEGRATIONS_COLLECTION } from './integrations.constants';

export interface IIntegration {
  _id?: Schema.Types.ObjectId;
  title: string;
  description: string;
  image: string;
  created_by?: Schema.Types.ObjectId;
  updated_by?: Schema.Types.ObjectId;
  is_disabled?: boolean;
  is_deleted?: boolean;
}

export const IntegrationSchema = new Schema<IIntegration>(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: false,
      default: ''
    },
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
    collection: INTEGRATIONS_COLLECTION,
  }
);

IntegrationSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
  this.lean();
}); 