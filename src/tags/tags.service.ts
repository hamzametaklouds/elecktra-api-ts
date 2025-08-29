import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { ITag } from './tags.schema';
import { TAGS_PROVIDER_TOKEN } from './tags.constants';

@Injectable()
export class TagsService {
  constructor(
    @Inject(TAGS_PROVIDER_TOKEN)
    private tagModel: Model<ITag>,
  ) {}

  async create(name: string, user: { userId?: ObjectId }): Promise<ITag> {
    const normalizedName = name.toLowerCase().trim();
    
    // Check if tag already exists
    const existingTag = await this.tagModel.findOne({ 
      normalized_name: normalizedName,
      is_deleted: false 
    });
    
    if (existingTag) {
      return existingTag;
    }

    const tag = new this.tagModel({
      name: name.trim(),
      normalized_name: normalizedName,
      created_by: user.userId,
    });

    return await tag.save();
  }

  async findByName(name: string): Promise<ITag | null> {
    const normalizedName = name.toLowerCase().trim();
    return await this.tagModel.findOne({ 
      normalized_name: normalizedName,
      is_deleted: false 
    });
  }

  async findById(id: string): Promise<ITag | null> {
    return await this.tagModel.findOne({ 
      _id: id,
      is_deleted: false 
    });
  }

  async findByIds(ids: string[]): Promise<ITag[]> {
    return await this.tagModel.find({ 
      _id: { $in: ids },
      is_deleted: false 
    });
  }

  async searchTags(query: string, limit: number = 10): Promise<ITag[]> {
    return await this.tagModel.find({
      $text: { $search: query },
      is_deleted: false,
      is_disabled: false
    })
    .sort({ usage_count: -1, name: 1 })
    .limit(limit);
  }

  async getAllTags(): Promise<ITag[]> {
    return await this.tagModel.find({
      is_deleted: false,
      is_disabled: false
    })
    .sort({ usage_count: -1, name: 1 });
  }

  async processTagsArray(tags: string[], user: { userId?: ObjectId }): Promise<ObjectId[]> {
    const tagIds: ObjectId[] = [];
    
    for (const tag of tags) {
      if (!tag || typeof tag !== 'string') continue;
      
      // Check if it's already a MongoDB ObjectId
      if (this.isValidObjectId(tag)) {
        const existingTag = await this.findById(tag);
        if (existingTag) {
          tagIds.push(existingTag._id);
        }
      } else {
        // Create new tag or find existing one
        const tagDoc = await this.create(tag, user);
        tagIds.push(tagDoc._id);
      }
    }
    
    return tagIds;
  }

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  async updateUsageCount(tagIds: ObjectId[]): Promise<void> {
    await this.tagModel.updateMany(
      { _id: { $in: tagIds } },
      { $inc: { usage_count: 1 } }
    );
  }
} 