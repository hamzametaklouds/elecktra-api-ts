import { Schema } from 'mongoose';
import { SYSTEM_USERS_COLLECTION } from 'src/system-users/system-users.constant';
import { QUERY_COLLECTION } from './queries.constants';


export enum QueryStatus {
    P = 'Pending',
    R = 'Rejected',
    A = 'Accepted'
}


export interface IQuery {
    _id?: Schema.Types.ObjectId;
    first_name: string;
    last_name: string;
    email: string;
    query: string;
    status: string;
    created_by?: Schema.Types.ObjectId;
    updated_by?: Schema.Types.ObjectId;
    is_disabled?: boolean;
    is_deleted?: boolean;
}

export const QuerySchema = new Schema<IQuery>(
    {
        first_name: {
            type: String,
            required: true,
            default: null
        },
        last_name: {
            type: String,
            required: true,
            default: null
        },
        email: {
            type: String,
            required: true,
            default: null
        },
        query: {
            type: String,
            required: true,
            default: null
        },
        status: {
            type: String,
            required: true,
            enum: QueryStatus,
            default: QueryStatus.P
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
        collection: QUERY_COLLECTION,
    }
);

QuerySchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
