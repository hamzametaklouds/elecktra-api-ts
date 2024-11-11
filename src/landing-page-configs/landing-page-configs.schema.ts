import { Schema } from 'mongoose';
import { SYSTEM_USERS_COLLECTION } from 'src/system-users/system-users.constant';
import { ILocation } from 'src/app/interfaces';
import { LANDING_PAGE_CONFIGS_COLLECTION } from './landing-page-configs.constants';



export interface ILandingPageConfigs {
    _id?: Schema.Types.ObjectId;
    hosts: number;
    cities: number;
    app_downloads: number
    created_by?: Schema.Types.ObjectId;
    updated_by?: Schema.Types.ObjectId;
    is_disabled?: boolean;
    is_deleted?: boolean;
}

export const LandingPageConfigsSchema = new Schema<ILandingPageConfigs>(
    {
        hosts: {
            type: Number,
            required: true,
            default: null
        },
        cities: {
            type: Number,
            required: true,
            default: null
        },
        app_downloads: {
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
        collection: LANDING_PAGE_CONFIGS_COLLECTION,
    }
);

LandingPageConfigsSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
