import { Schema } from 'mongoose';
import { SYSTEM_USERS_COLLECTION } from 'src/system-users/system-users.constant';
import { FAQ_COLLECTION } from './faq.constants';

export enum ValidForType {
    MOBILE = 'mobile',
    COMPANY = 'company'
}

export interface IFAQ {
    _id?: Schema.Types.ObjectId;
    question: string;
    answer: string;
    valid_for: string[];
    files: string[];
    created_by?: Schema.Types.ObjectId;
    updated_by?: Schema.Types.ObjectId;
    is_disabled?: boolean;
    is_deleted?: boolean;
}

export const FAQSchema = new Schema<IFAQ>(
    {
        question: {
            type: String,
            required: true,
        },
        answer: {
            type: String,
            required: true,
        },
        files: {
            type: [String],
            required: false,
        },
        valid_for: {
            type: [String],
            enum: Object.values(ValidForType),
            required: true,
            default: [ValidForType.MOBILE, ValidForType.COMPANY]
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
            updatedAt: 'updated_at'
        },
        collection: FAQ_COLLECTION,
    }
);

FAQSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
}); 