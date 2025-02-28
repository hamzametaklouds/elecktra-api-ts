import { Schema } from 'mongoose';
import { SYSTEM_USERS_COLLECTION } from 'src/system-users/system-users.constant';
import { FAQ_COLLECTION } from './faq.constants';

export enum ValidForType {
    MOBILE = 'mobile',
    COMPANY = 'company',
    BOTH = 'both'
}

export enum FAQType {
    VIDEO = 'video',
    PDF = 'pdf',
    TEXT = 'text'
}

export interface IFAQ {
    _id?: Schema.Types.ObjectId;
    question?: string;
    answer?: string;
    type: FAQType;
    valid_for: ValidForType;
    files?: string[];
    created_by?: Schema.Types.ObjectId;
    updated_by?: Schema.Types.ObjectId;
    is_disabled?: boolean;
    is_deleted?: boolean;
}

export const FAQSchema = new Schema<IFAQ>(
    {
        question: {
            type: String,
            required: false,
        },
        answer: {
            type: String,
            required: false,
        },
        type: {
            type: String,
            enum: Object.values(FAQType),
            required: true
        },
        files: {
            type: [String],
            required: false,
            validate: {
                validator: function(files: string[]) {
                    if (!files || files.length === 0) return true;
                    
                    const type = this.type;
                    if (type === FAQType.PDF) {
                        return files.every(file => file.toLowerCase().endsWith('.pdf'));
                    }
                    if (type === FAQType.VIDEO) {
                        return files.every(file => 
                            file.toLowerCase().match(/\.(mp4|mov|avi|wmv|flv|mkv)$/));
                    }
                    return true;
                },
                message: 'Files must match the specified type (PDF/Video)'
            }
        },
        valid_for: {
            type: String,
            enum: Object.values(ValidForType),
            required: true,
            default: ValidForType.BOTH
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