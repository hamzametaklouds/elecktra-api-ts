import { Schema } from 'mongoose';
import { USERS_COLLECTION } from 'src/users/users.constants';
import { NOTIFICATIONS_COLLECTION } from './notifications.constants';

export interface INotification {
  _id?: Schema.Types.ObjectId;
  title: string;
  description: string;
  is_disabled?: boolean;
  is_deleted?: boolean;
  created_by?: Schema.Types.ObjectId;
  created_at?: Date;
  updated_at?: Date;
}

export const NotificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    is_disabled: {
      type: Boolean,
      default: false,
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
      updatedAt: 'updated_at',
    },
    collection: NOTIFICATIONS_COLLECTION,
  }
);

NotificationSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
  this.lean();
}); 