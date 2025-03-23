import { Injectable, Inject, NotFoundException, BadRequestException, forwardRef } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import {  MESSAGES_PROVIDER_TOKEN } from './chat.constants';
import { CreateMessageDto } from './dtos/create-message.dto';
import { CompanyService } from 'src/company/company.service';
import { UsersService } from 'src/users/users.service';
import { IMessage } from './messages.schema';

@Injectable()
export class ChatService {
  constructor(
    @Inject(MESSAGES_PROVIDER_TOKEN)
    private messageModel: Model<IMessage>,
    @Inject(forwardRef(() => CompanyService))
    private companyService: CompanyService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async getCompanyMessages(user: { userId?: ObjectId, company_id?: ObjectId }, page: number = 1, limit: number = 50) {
    if (!user.company_id) {
      throw new BadRequestException('User is not associated with any company');
    }

    const messages = await this.messageModel
      .find({ 
        company_id: user.company_id,
        is_deleted: false 
      })
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender_id', 'first_name last_name image')
      .populate('user_mentions', 'first_name last_name image')
      .populate('agent_mentions', 'title sub_title image');

    return messages.reverse(); // Return in chronological order
  }

  async createMessage(createMessageDto: CreateMessageDto, user: { userId?: ObjectId, company_id?: ObjectId }) {
    if (!user.company_id) {
      throw new BadRequestException('User is not associated with any company');
    }

    const message = new this.messageModel({
      company_id: user.company_id,
      sender_id: user.userId,
      content: createMessageDto.content,
      user_mentions: createMessageDto.user_mentions || [],
      agent_mentions: createMessageDto.agent_mentions || [],
    });

    const savedMessage = await message.save();
    
    return await this.messageModel.findById(savedMessage._id)
      .populate('sender_id', 'first_name last_name image')
      .populate('user_mentions', 'first_name last_name image')
      .populate('agent_mentions', 'title sub_title image');
  }

  async deleteMessage(messageId: string, user: { userId?: ObjectId, company_id?: ObjectId }) {
    const message = await this.messageModel.findOne({
      _id: messageId,
      company_id: user.company_id,
      sender_id: user.userId,
      is_deleted: false
    });

    if (!message) {
      throw new NotFoundException('Message not found or unauthorized');
    }

    return await this.messageModel.findByIdAndUpdate(
      messageId,
      { is_deleted: true },
      { new: true }
    )
    .populate('sender_id', 'first_name last_name image')
    .populate('user_mentions', 'first_name last_name image')
    .populate('agent_mentions', 'title sub_title image');
  }

  async editMessage(messageId: string, content: string, user: { userId?: ObjectId, company_id?: ObjectId }) {
    const message = await this.messageModel.findOne({
      _id: messageId,
      company_id: user.company_id,
      sender_id: user.userId,
      is_deleted: false
    });

    if (!message) {
      throw new NotFoundException('Message not found or unauthorized');
    }

    return await this.messageModel.findByIdAndUpdate(
      messageId,
      { 
        content,
        is_edited: true,
        updated_at: new Date()
      },
      { new: true }
    )
    .populate('sender_id', 'first_name last_name image')
    .populate('user_mentions', 'first_name last_name image')
    .populate('agent_mentions', 'title sub_title image');
  }
} 