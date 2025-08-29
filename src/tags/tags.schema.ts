import { Schema } from 'mongoose';
import { TAGS_COLLECTION } from './tags.constants';

export interface ITag {
  _id?: Schema.Types.ObjectId;
  name: string;
  normalized_name: string;
  description?: string;
  color?: string;
  created_by?: Schema.Types.ObjectId;
  updated_by?: Schema.Types.ObjectId;
  is_disabled?: boolean;
  is_deleted?: boolean;
  usage_count?: number;
}

export const TagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    normalized_name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: false,
      default: ''
    },
    color: {
      type: String,
      required: false,
      default: '#3B82F6'
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: false
    },
    updated_by: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: false
    },
    is_disabled: {
      type: Boolean,
      default: false
    },
    is_deleted: {
      type: Boolean,
      default: false
    },
    usage_count: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    collection: TAGS_COLLECTION
  }
);

// Create text index for search
TagSchema.index({ 
  name: 'text', 
  normalized_name: 'text',
  description: 'text' 
});

// Pre-save hook to normalize name
TagSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.normalized_name = this.name.toLowerCase().trim();
  }
  next();
});

// Pre-findOneAndUpdate hook
TagSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  
  if (update.name) {
    update.normalized_name = update.name.toLowerCase().trim();
  }
  
  next();
}); 