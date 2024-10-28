import { Schema } from 'mongoose';
import { SYSTEM_USERS_COLLECTION } from 'src/system-users/system-users.constant';
import { COMPANIES_COLLECTION } from './companies.constant';

export interface ICompanies {
    _id?: Schema.Types.ObjectId;
    title: string;
    description: string;
    icon: string;
    created_by?: Schema.Types.ObjectId;
    updated_by?: Schema.Types.ObjectId;
    is_disabled?: boolean;
    is_deleted?: boolean;
}

export const CompaniesSchema = new Schema<ICompanies>(
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
        icon: {
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
        collection: COMPANIES_COLLECTION,
    }
);

CompaniesSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
