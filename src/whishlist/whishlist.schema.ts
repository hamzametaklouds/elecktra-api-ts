import { Schema } from 'mongoose';
import { SYSTEM_USERS_COLLECTION } from 'src/system-users/system-users.constant';
import { WHISHLIST_COLLECTION } from './whishlist.constants';


export interface IWhishlist {
    _id?: Schema.Types.ObjectId;
    user_id: Schema.Types.ObjectId;
    hotels: Schema.Types.ObjectId[];
    cars: Schema.Types.ObjectId[];
    created_by?: Schema.Types.ObjectId;
    updated_by?: Schema.Types.ObjectId;
    is_disabled?: boolean;
    is_deleted?: boolean;
}

export const WhishlistSchema = new Schema<IWhishlist>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            required: true,
            default: null
        },
        hotels: {
            type: [Schema.Types.ObjectId],
            required: true,
            default: null
        },
        cars: {
            type: [Schema.Types.ObjectId],
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
        collection: WHISHLIST_COLLECTION,
    }
);

WhishlistSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
