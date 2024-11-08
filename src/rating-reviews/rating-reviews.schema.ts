import { Schema } from 'mongoose';
import { SYSTEM_USERS_COLLECTION } from 'src/system-users/system-users.constant';
import { RATING_REVIWS_COLLECTION } from './rating-reviews.constant';




export enum UserType {
    H = 'Host',
    U = 'User'
}

export interface IReviewAndRatings {
    _id?: Schema.Types.ObjectId;
    review: string;
    rating: number;
    hotel_or_car?: Schema.Types.ObjectId;
    booking_id?: Schema.Types.ObjectId;
    custom_review: boolean;
    name: string;
    image: string;
    designation: string
    user_type: string;
    created_by?: Schema.Types.ObjectId;
    updated_by?: Schema.Types.ObjectId;
    is_disabled?: boolean;
    is_deleted?: boolean;
}

export const ReviewAndRatingSchema = new Schema<IReviewAndRatings>(
    {
        review: {
            type: String,
            required: true,
            default: null
        },
        rating: {
            type: Number,
            required: true,
            default: null
        },
        hotel_or_car: {
            type: Schema.Types.ObjectId,
            required: false,
            default: null
        },
        booking_id: {
            type: Schema.Types.ObjectId,
            required: false,
            default: null
        },
        custom_review: {
            type: Boolean,
            required: false,
            default: false,
        },
        name: {
            type: String,
            required: true,
            default: null
        },
        image: {
            type: String,
            required: true,
            default: null
        },
        user_type: {
            type: String,
            required: true,
            enum: UserType,
            default: UserType.U
        },
        designation: {
            type: String,
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
        collection: RATING_REVIWS_COLLECTION,
    }
);

ReviewAndRatingSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
