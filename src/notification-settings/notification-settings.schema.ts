import { Schema, Types } from 'mongoose';
import { USERS_COLLECTION } from 'src/users/users.constants';
import { NOTIFICATION_SETTINGS_COLLECTION } from './notification-settings.constants';

export interface INotificationSettings {
  _id?: Types.ObjectId;
  user_id: Types.ObjectId;
  desktop_notifications: boolean;
  purchase_notifications: boolean;
  all_notifications: boolean;
  is_disabled?: boolean;
  is_deleted?: boolean;
  created_by?: Types.ObjectId;
  updated_by?: Types.ObjectId;
  created_at?: Date;
  updated_at?: Date;
}

export const NotificationSettingsSchema = new Schema<INotificationSettings>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: USERS_COLLECTION,
      required: true,
      unique: true,
    },
    desktop_notifications: {
      type: Boolean,
      default: true,
    },
    purchase_notifications: {
      type: Boolean,
      default: true,
    },
    all_notifications: {
      type: Boolean,
      default: true,
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
    updated_by: {
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
    collection: NOTIFICATION_SETTINGS_COLLECTION,
  }
);

NotificationSettingsSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
  this.lean();
}); 