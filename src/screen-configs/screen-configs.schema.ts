import { Schema } from 'mongoose';
import { SCREEN_CONFIGS_COLLECTION } from './screen-configs.constants';
import { SYSTEM_USERS_COLLECTION } from 'src/system-users/system-users.constant';

export enum ScreenType {
    O = 'Onboarding',
    L = 'Landing',
    H = 'Home'
}

export interface IScreenConfigs {
    _id?: Schema.Types.ObjectId;
    title: string;
    description: string;
    type: string;
    images: string[]
    order_number: number;
    created_by?: Schema.Types.ObjectId;
    updated_by?: Schema.Types.ObjectId;
    is_disabled?: boolean;
    is_deleted?: boolean;
}

export const ScreenConfigSchema = new Schema<IScreenConfigs>(
    {
        title: {
            type: String,
            required: true,
            default: null
        },
        description: {
            type: String,
            required: true,
            default: null
        },
        type: {
            type: String,
            required: true,
            enum: ScreenType,
            default: null
        },
        images: {
            type: [String],
            required: true,
            default: null
        },
        order_number: {
            type: Number,
            required: true,
            default: null
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
        collection: SCREEN_CONFIGS_COLLECTION,
    }
);

ScreenConfigSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
