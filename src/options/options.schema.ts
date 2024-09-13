import { Schema } from 'mongoose';
import { SYSTEM_USERS_COLLECTION } from 'src/system-users/system-users.constant';
import { OPTIONS_COLLECTION } from './options.constants';

export enum OptionParentType {
    S = 'Stay',
    C = 'Car'
}

export enum OptionSubType {
    VT = 'Vehicle Type',
    T = 'Transmission',
    FT = 'Fuel Type'
}




export interface IOptions {
    _id?: Schema.Types.ObjectId;
    title: string;
    description: string;
    parent_type: string;
    sub_type: string;
    created_by?: Schema.Types.ObjectId;
    updated_by?: Schema.Types.ObjectId;
    is_disabled?: boolean;
    is_deleted?: boolean;
}

export const OptionSchema = new Schema<IOptions>(
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
        parent_type: {
            type: String,
            required: false,
            enum: OptionParentType,
            default: OptionParentType.C
        },
        sub_type: {
            type: String,
            required: false,
            enum: OptionSubType,
            default: OptionSubType.FT
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
        collection: OPTIONS_COLLECTION,
    }
);

OptionSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
