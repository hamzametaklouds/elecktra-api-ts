import { Schema } from 'mongoose';
import { COMPANY_COLLECTION } from 'src/company/company.constants';
import { USERS_COLLECTION } from 'src/users/users.constants';
import { AGENT_REQUESTS_COLLECTION } from 'src/agent-requests/agent-requests.constants';
import { CHAT_CHANNELS_COLLECTION } from './chat.constants';

export interface IMention {
  mentionId: Schema.Types.ObjectId;
  mentionType: string;
}

export interface IMessage {
  _id?: Schema.Types.ObjectId;
  sender_id: Schema.Types.ObjectId;
  content: string;
  mentions: IMention[]; // Updated to store both type and ID
  created_at: Date;
  updated_at?: Date;
  is_edited: boolean;
  is_deleted: boolean;
}

const MentionSchema = new Schema({
  mentionId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'mentions.mentionType'
  },
  mentionType: {
    type: String,
    required: true,
    enum: [USERS_COLLECTION, AGENT_REQUESTS_COLLECTION]
  }
});

const MessageSchema = new Schema<IMessage>({
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: USERS_COLLECTION,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  mentions: [MentionSchema],
  created_at: {
    type: Date,
    default: Date.now
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
});

export interface IChatChannel {
  _id?: Schema.Types.ObjectId;
  name: string;
  company_id: Schema.Types.ObjectId;
  description?: string;
  members: Schema.Types.ObjectId[];
  agent_requests: Schema.Types.ObjectId[];
  created_by: Schema.Types.ObjectId;
  updated_by?: Schema.Types.ObjectId;
  is_disabled: boolean;
  is_deleted: boolean;
}

export const ChatChannelSchema = new Schema<IChatChannel>({
  name: {
    type: String,
    required: true
  },
  company_id: {
    type: Schema.Types.ObjectId,
    ref: COMPANY_COLLECTION,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: USERS_COLLECTION
  }],
  agent_requests: [{
    type: Schema.Types.ObjectId,
    ref: AGENT_REQUESTS_COLLECTION
  }],
  created_by: {
    type: Schema.Types.ObjectId,
    ref: USERS_COLLECTION,
    required: true
  },
  updated_by: {
    type: Schema.Types.ObjectId,
    ref: USERS_COLLECTION,
    required: false
  },
  is_disabled: {
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
  collection: CHAT_CHANNELS_COLLECTION
});

ChatChannelSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
  this.lean();
}); 