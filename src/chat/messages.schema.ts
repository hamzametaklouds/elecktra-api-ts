import { Schema } from 'mongoose';
import { USERS_COLLECTION } from 'src/users/users.constants';
import { AGENT_REQUESTS_COLLECTION } from 'src/agent-requests/agent-requests.constants';
import { MESSAGES_COLLECTION } from './chat.constants';
import { COMPANY_COLLECTION } from 'src/company/company.constants';

export interface IMessage {
  _id?: Schema.Types.ObjectId;
  company_id: Schema.Types.ObjectId;
  sender_id: Schema.Types.ObjectId;
  content: string;
  user_mentions: Schema.Types.ObjectId[];
  agent_mentions: Schema.Types.ObjectId[];
  created_at: Date;
  updated_at?: Date;
  is_edited: boolean;
  is_deleted: boolean;
}

export const MessageSchema = new Schema<IMessage>({
  company_id: {
    type: Schema.Types.ObjectId,
    ref: COMPANY_COLLECTION,
    required: true,
    index: true
  },
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: USERS_COLLECTION,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  user_mentions: [{
    type: Schema.Types.ObjectId,
    ref: USERS_COLLECTION,
    required: false
  }],
  agent_mentions: [{
    type: Schema.Types.ObjectId,
    ref: AGENT_REQUESTS_COLLECTION,
    required: false
  }],
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  updated_at: {
    type: Date,
    required: false
  },
  is_edited: {
    type: Boolean,
    default: false
  },
  is_deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  collection: MESSAGES_COLLECTION
});

MessageSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
  this.lean();
}); 