import { Schema } from 'mongoose';
import { SYSTEM_USERS_COLLECTION } from 'src/system-users/system-users.constant';
import { RECENT_SEARCHS_COLLECTION } from './recent-searchs.constants';
import { ILocation } from 'src/app/interfaces';

export enum OptionParentType {
    S = 'Stay',
    C = 'Car'
}


export interface IRecentSearchs {
    _id?: Schema.Types.ObjectId;
    title: string;
    address: string;
    start_date: Date;
    end_date: Date;
    infants: number;
    adults: number;
    children: number;
    location: ILocation;
    type: string;
    created_by?: Schema.Types.ObjectId;
    updated_by?: Schema.Types.ObjectId;
    is_disabled?: boolean;
    is_deleted?: boolean;
}

export const RecentSearchSchema = new Schema<IRecentSearchs>(
    {
        title: {
            type: String,
            required: true,
            default: null
        },
        address: {
            type: String,
            required: true,
            default: null
        },
        start_date: {
            type: Date,
            required: false,
            default: null
        },
        end_date: {
            type: Date,
            required: false,
            default: null
        },
        adults: {
            type: Number,
            required: false,
            default: 0
        },
        children: {
            type: Number,
            required: false,
            default: 0
        },
        infants: {
            type: Number,
            required: false,
            default: 0
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
                default: 'Point'
            },
            coordinates: {
                type: [Number],  // [longitude, latitude]
                required: true
            }
        },
        type: {
            type: String,
            required: true,
            default: OptionParentType.S
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
        collection: RECENT_SEARCHS_COLLECTION,
    }
);

RecentSearchSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
