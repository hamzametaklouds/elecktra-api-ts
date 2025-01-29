import { Schema } from 'mongoose';
import { SYSTEM_USERS_COLLECTION } from 'src/system-users/system-users.constant';
import { APP_CONFIGS_COLLECTION } from './landing-page-configs.constants';

export interface IAppConfigs {
    _id?: Schema.Types.ObjectId;
    welcome_slides: { image: string; title: string }[];
    created_by?: Schema.Types.ObjectId;
    updated_by?: Schema.Types.ObjectId;
    is_disabled?: boolean;
    is_deleted?: boolean;
}

export const AppConfigsSchema = new Schema<IAppConfigs>(
    {
        welcome_slides: {
            type: [{ image: String, title: String }],
            required: true,
            default: [],
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
        },
        collection: APP_CONFIGS_COLLECTION,
    }
);

AppConfigsSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});