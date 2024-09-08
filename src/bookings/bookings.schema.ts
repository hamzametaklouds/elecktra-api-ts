import { Schema } from 'mongoose';
import { SYSTEM_USERS_COLLECTION } from 'src/system-users/system-users.constant';
import { BOOKINGS_COLLECTION } from './bookings.constants';


export enum BookingType {
    C = 'Car',
    H = 'Hotel'
}

export enum BookingStatus {
    P = 'Pending',
    C = 'Completed',
    CN = 'Cancelled',
}

export interface IGuests {
    _id?: Schema.Types.ObjectId;
    adults: number;
    children: number;
    infants: number;
}


export const GuestSchema = new Schema<IGuests>(
    {
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
    }
)


export interface IBookings {
    _id?: Schema.Types.ObjectId;
    hotel_or_car: Schema.Types.ObjectId;
    rooms_reserved: number;
    start_date: Date;
    end_date: Date;
    guests: IGuests;
    current_location: string;
    nights: number;
    booking_type: string;
    status: string;
    created_by?: Schema.Types.ObjectId;
    updated_by?: Schema.Types.ObjectId;
    is_disabled?: boolean;
    is_deleted?: boolean;
}

export const BookingSchema = new Schema<IBookings>(
    {
        hotel_or_car: {
            type: Schema.Types.ObjectId,
            required: true,
            default: null
        },
        rooms_reserved: {
            type: Number,
            required: true,
            default: null
        },
        start_date: {
            type: Date,
            required: true,
            default: null
        },
        end_date: {
            type: Date,
            required: true,
            default: null
        },
        guests: {
            type: GuestSchema,
            required: false,
            default: null
        },
        current_location: {
            type: String,
            required: true,
            default: null
        },
        nights: {
            type: Number,
            required: false,
            default: 0,
        },
        booking_type: {
            type: String,
            required: false,
            enum: BookingType,
            default: null,
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
        collection: BOOKINGS_COLLECTION,
    }
);

BookingSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
