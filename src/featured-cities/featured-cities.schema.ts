import { Schema } from 'mongoose';
import { SYSTEM_USERS_COLLECTION } from 'src/system-users/system-users.constant';
import { ILocation } from 'src/app/interfaces';
import { FEATURED_CITIES_COLLECTION } from './featured-cities.constants';

export interface IFeaturedCities {
    _id?: Schema.Types.ObjectId;
    title: string;
    description: string;
    address: string;
    location: ILocation;
    images: string[];
    created_by?: Schema.Types.ObjectId;
    updated_by?: Schema.Types.ObjectId;
    is_disabled?: boolean;
    is_deleted?: boolean;
}

export const FeaturedCitiesSchema = new Schema<IFeaturedCities>(
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
        address: {
            type: String,
            required: true,
            default: null
        },
        images: {
            type: [String],
            required: true,
            default: null
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
        collection: FEATURED_CITIES_COLLECTION,
    }
);

FeaturedCitiesSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
}); 