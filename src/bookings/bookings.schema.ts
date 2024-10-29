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
    CR = 'Created',
    CK = 'Checkout',
}


export interface IGuests {
    _id?: Schema.Types.ObjectId;
    adults: number;
    children: number;
    infants: number;
}

export interface IPayment {
    customer_id: string;
    payment_method_id: string;
    payment_id: string;
    amount: number;
    currency: string;
    payment_status: string;
}

export const PaymentSchema = new Schema<IPayment>(
    {
        customer_id: {
            type: String,
            required: false,
            default: null
        },
        payment_method_id: {
            type: String,
            required: false,
            default: null
        },
        payment_id: {
            type: String,
            required: false,
            default: null
        },
        amount: {
            type: Number,
            required: false,
            default: null
        },
        currency: {
            type: String,
            required: false,
            default: null
        },
        payment_status: {
            type: String,
            required: false,
            default: null
        },
    }
)

export interface ITaxAndFee {
    _id: Schema.Types.ObjectId;
    tax_percentage: number,
    total_tax_applied: number

}

export const TaxAndFeeSchema = new Schema<ITaxAndFee>(
    {

        tax_percentage: {
            type: Number,
            required: false,
            default: 0,
        },
        total_tax_applied: {
            type: Number,
            required: false,
            default: 0
        },

    },
);



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
    start_date: Date;
    end_date: Date;
    guests: IGuests;
    nights: number;
    type: string;
    status: string;
    sub_total: number;
    payment: IPayment;
    taxes_and_fees: ITaxAndFee;
    reference_number: string;
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
        payment: {
            type: PaymentSchema,
            required: false,
            default: null
        },
        guests: {
            type: GuestSchema,
            required: false,
            default: null
        },
        taxes_and_fees: {
            type: TaxAndFeeSchema,
            required: false,
            default: null
        },
        reference_number: {
            type: String,
            required: true,
            default: null
        },
        sub_total: {
            type: Number,
            required: true,
            default: null
        },
        nights: {
            type: Number,
            required: false,
            default: 0,
        },
        type: {
            type: String,
            required: false,
            enum: BookingType,
            default: BookingType.H,
        },
        status: {
            type: String,
            required: false,
            enum: BookingStatus,
            default: BookingStatus.CR,
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
