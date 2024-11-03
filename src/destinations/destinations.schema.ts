import { Schema } from 'mongoose';
import { SYSTEM_USERS_COLLECTION } from 'src/system-users/system-users.constant';
import { DESTINATIONS_COLLECTION } from './destinations.constants';
import { ILocation } from 'src/app/interfaces';



export interface IDestinations {
    _id?: Schema.Types.ObjectId;
    title: string;
    description: string;
    images: string[]
    location: ILocation
    is_popular: boolean;
    created_by?: Schema.Types.ObjectId;
    updated_by?: Schema.Types.ObjectId;
    is_disabled?: boolean;
    is_deleted?: boolean;
}

export const DestinationSchema = new Schema<IDestinations>(
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
        // lat: {
        //     type: Number,
        //     required: true,
        //     default: null
        // },
        // long: {
        //     type: Number,
        //     required: true,
        //     default: null
        // },
        is_popular: {
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
        collection: DESTINATIONS_COLLECTION,
    }
);

DestinationSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
