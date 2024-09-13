import { Schema } from 'mongoose';
import { SYSTEM_USERS_COLLECTION } from 'src/system-users/system-users.constant';
import { HOTEL_AND_CARS_COLLECTION } from './hotel-and-cars.constants';
import { OPTIONS_COLLECTION } from 'src/options/options.constants';


export enum RecordType {
    C = 'Car',
    H = 'Hotel'
}

export enum BookingStatus {
    P = 'Pending',
    C = 'Completed',
    CN = 'Cancelled',
}

export interface ICarDetails {
    _id?: Schema.Types.ObjectId;
    year: number;
    seats: number;
    mileage: string
    fuel_type: string
    transmission: string
    duration_conditions: string[]
    owner_rules: string
}

export const CarDetailSchema = new Schema<ICarDetails>(
    {
        year: {
            type: Number,
            required: false,
            default: null
        },
        seats: {
            type: Number,
            required: false,
            default: null
        },
        mileage: {
            type: String,
            required: false,
            default: null
        },

        fuel_type: {
            type: String,
            required: false,
            default: null
        },

        transmission: {
            type: String,
            required: false,
            default: null
        },
        duration_conditions: {
            type: [String],
            required: false,
            default: null
        },
        owner_rules: {
            type: String,
            required: false,
            default: null
        }

    }
)

export interface IHighlights {
    _id?: Schema.Types.ObjectId;
    icon: string;
    deatail: string;
}

export interface IHotelDetails {
    _id?: Schema.Types.ObjectId;
    cancellation_policy: string;
    ground_rules: string;
}

export const HotelDetailsSchema = new Schema<IHotelDetails>(
    {
        cancellation_policy: {
            type: String,
            required: false,
            default: null
        },
        ground_rules: {
            type: String,
            required: false,
            default: null
        }
    }
)



export const HighlightSchema = new Schema<IHighlights>(
    {
        icon: {
            type: String,
            required: false,
            default: null
        },
        deatail: {
            type: String,
            required: false,
            default: null
        }
    }
)


export interface IHotelAndCars {
    _id?: Schema.Types.ObjectId;
    title: string;
    description: string;
    images: string[]
    address: string;
    highlights: IHighlights[]
    amenities: Schema.Types.ObjectId[]
    car_options: Schema.Types.ObjectId[]
    type: string;
    lat: number;
    long: number;
    price: number;
    total_rooms: number;
    rooms_reserved: number;
    availability_from: Date;
    availability_till: Date;
    host_or_owner: Schema.Types.ObjectId
    car_details: ICarDetails
    hotel_details: IHotelDetails
    is_available?: boolean;
    created_by?: Schema.Types.ObjectId;
    updated_by?: Schema.Types.ObjectId;
    is_disabled?: boolean;
    is_deleted?: boolean;
}

export const HotelAndCarSchema = new Schema<IHotelAndCars>(
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
        address: {
            type: String,
            required: true,
            default: null
        },
        highlights: {
            type: [HighlightSchema],
            required: true,
            default: null
        },
        amenities: {
            type: [Schema.Types.ObjectId],
            required: true,
            default: null,
            ref: OPTIONS_COLLECTION
        },
        car_options: {
            type: [Schema.Types.ObjectId],
            required: true,
            default: null,
            ref: OPTIONS_COLLECTION
        },
        type: {
            type: String,
            required: true,
            enum: RecordType,
            default: RecordType.H
        },
        lat: {
            type: Number,
            required: true,
            default: null
        },
        long: {
            type: Number,
            required: true,
            default: null
        },
        price: {
            type: Number,
            required: true,
            default: null
        },
        total_rooms: {
            type: Number,
            required: true,
            default: null
        },
        rooms_reserved: {
            type: Number,
            required: true,
            default: null
        },
        availability_from: {
            type: Date,
            required: true,
            default: null
        },
        availability_till: {
            type: Date,
            required: true,
            default: null
        },
        host_or_owner: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: SYSTEM_USERS_COLLECTION,
        },
        car_details: {
            type: CarDetailSchema,
            required: false,
            default: null
        },
        hotel_details: {
            type: HotelDetailsSchema,
            required: false,
            default: null
        },
        is_available: {
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
        collection: HOTEL_AND_CARS_COLLECTION,
    }
);

HotelAndCarSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
