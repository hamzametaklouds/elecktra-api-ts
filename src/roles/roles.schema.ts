import { Schema } from 'mongoose';
import { SYSTEM_USERS_COLLECTION } from 'src/system-users/system-users.constant';
import { ROLES_COLLECTION } from './roles.constant';



export enum Role {
    SUPER_ADMIN = 'super_admin',
    INTERNAL_ADMIN = 'internal_admin',
    COMPANY_ADMIN = 'company_admin',
}



export interface IRoles {
    _id?: Schema.Types.ObjectId;
    title: string;
    description: string;
    icon: string;
    created_by?: Schema.Types.ObjectId;
    updated_by?: Schema.Types.ObjectId;
    is_disabled?: boolean;
    is_deleted?: boolean;
}

export const RolesSchema = new Schema<IRoles>(
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
        collection: ROLES_COLLECTION,
    }
);

RolesSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
