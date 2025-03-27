import { Injectable, Inject, NotFoundException, BadRequestException, forwardRef } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { MESSAGES_PROVIDER_TOKEN } from './chat.constants';
import { CreateMessageDto } from './dtos/create-message.dto';
import { CompanyService } from 'src/company/company.service';
import { UsersService } from 'src/users/users.service';
import { IMessage } from './messages.schema';
import {  IAgentWebhookPayload } from './interfaces/agent-response.interface';
import axios from 'axios';
import { DeliveredAgentsService } from 'src/delivered-agents/delivered-agents.service';

interface IPopulatedAgent {
  _id: ObjectId;
  agent_assistant_id: string;
  title: string;
}

interface IAgentResponse {
  output: {
    agent_id: string;
    message: string;
  }
}

@Injectable()
export class ChatService {
  private readonly AGENT_WEBHOOK_URL = 'https://n8n-electra-ee6070d900af.herokuapp.com/webhook/dc6aa2eb-f778-4af7-832e-0e9073273b00';

  constructor(
    @Inject(MESSAGES_PROVIDER_TOKEN)
    private messageModel: Model<IMessage>,
    @Inject(forwardRef(() => CompanyService))
    private companyService: CompanyService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => DeliveredAgentsService))
    private deliveredAgentsService: DeliveredAgentsService,
  ) {}

  private async callAgentWebhook(payload: IAgentWebhookPayload): Promise<IAgentResponse> {
    try {
      const response = await axios.post(this.AGENT_WEBHOOK_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      return response.data;
    } catch (error) {
      throw new BadRequestException(`Failed to call agent webhook: ${error.message}`);
    }
  }

  async getCompanyMessages(user: { userId?: ObjectId, company_id?: ObjectId }, page: number = 1, limit: number = 50) {
    if (!user.company_id) {
      throw new BadRequestException('User is not associated with any company');
    }

    const totalDocuments = await this.messageModel.countDocuments({ 
      company_id: user.company_id,
      is_deleted: false 
    });
    
    const totalPages = Math.ceil(totalDocuments / limit);
    const skip = (page - 1) * limit;

    const messages = await this.messageModel
      .find({ 
        company_id: user.company_id,
        is_deleted: false 
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender_id', 'first_name last_name image')
      .populate('agent_id', 'title image')
      .populate('user_mentions', 'first_name last_name image')
      .populate('agent_mentions', 'title image');

    return {
      pages: `Page ${page} of ${totalPages}`,
      current_page: page,
      total_pages: totalPages,
      total_records: totalDocuments,
      data: messages.reverse() // Return in chronological order
    };
  }

  async createMessage(createMessageDto, user: { userId?: ObjectId, company_id?: ObjectId }) {
    console.log('createMessage DTO:', createMessageDto);
    console.log('createMessage user:', user);
    
    if (!createMessageDto.company_id) {
      throw new BadRequestException('User is not associated with any company');
    }

    const message = new this.messageModel({
      company_id: user.company_id,
      sender_id: user.userId,
      created_by: user.userId,
      content: createMessageDto.content,
      user_mentions: createMessageDto.user_mentions || [],
      agent_mentions: createMessageDto.agent_mentions || [],
    });

    const savedMessage = await message.save();
    
    return await this.messageModel.findById(savedMessage._id)
      .populate('sender_id', 'first_name last_name image')
      .populate('user_mentions', 'first_name last_name image')
      .populate('agent_mentions', 'title image');
  }
  async createMessageSocket(createMessageDto: CreateMessageDto & { company_id: ObjectId; userId: ObjectId }) {
    if (!createMessageDto.company_id) {
      throw new BadRequestException('User is not associated with any company');
    }

    // Create initial user message
    const userMessage = new this.messageModel({
      company_id: createMessageDto.company_id,
      sender_id: createMessageDto.userId,
      created_by: createMessageDto.userId,
      content: createMessageDto.content,
      user_mentions: createMessageDto.user_mentions || [],
      agent_mentions: createMessageDto.agent_mentions || [],
    });

    console.log('userMessage', userMessage);

    const savedUserMessage = await userMessage.save();

    // Handle agent mentions if any
    if (createMessageDto.agent_mentions?.length > 0) {
      const populatedAgents = await this.messageModel
        .findById(savedUserMessage._id)
        .populate('agent_mentions') as any;

        console.log('populatedAgents', populatedAgents);

      const agentResponses: IMessage[] = [];
      for (const agent of populatedAgents.agent_mentions) {
        console.log('agent', agent);
        const agentDoc = agent as IPopulatedAgent;
        if (!agentDoc.agent_assistant_id) continue;

        const webhookPayload: IAgentWebhookPayload = {
          agentId: agentDoc.agent_assistant_id,
          businessId: createMessageDto.company_id.toString(),
          message: createMessageDto.content,
          executionMode: 'production'
        };

        console.log('webhookPayload', webhookPayload);

        const agentResponse = await this.callAgentWebhook(webhookPayload);

        console.log('agentResponse', agentResponse);

        // Create agent response message
        const agentMessage = new this.messageModel({
          company_id: createMessageDto.company_id,
          agent_id: agentDoc._id,
          assistant_id: agentResponse?.output?.agent_id?agentResponse?.output?.agent_id:agentResponse['agent_id']?agentResponse['agent_id']:null,
          content: agentResponse?.output?.message?agentResponse?.output?.message:agentResponse['message']?agentResponse['message']:null,
          user_mentions: [],
          agent_mentions: [],
        });

        console.log('agentMessage', agentMessage);

        const savedAgentMessage = await agentMessage.save();
        agentResponses.push(savedAgentMessage);
      }

      // Return both user message and agent responses
      return {
        userMessage: await this.messageModel.findById(savedUserMessage._id)
          .populate('sender_id', 'first_name last_name image')
          .populate('user_mentions', 'first_name last_name image')
          .populate('agent_mentions', 'title image'),
        agentResponses: await Promise.all(
          agentResponses.map(msg => 
            this.messageModel.findById(msg._id)
              .populate('agent_id', 'title image')
          )
        )
      };
    }

    // If no agent mentions, return just the user message
    return {
      userMessage: await this.messageModel.findById(savedUserMessage._id)
        .populate('sender_id', 'first_name last_name image')
        .populate('user_mentions', 'first_name last_name image')
        .populate('agent_mentions', 'title image'),
      agentResponses: []
    };
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
    .populate('agent_mentions', 'title image');
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
    .populate('agent_mentions', 'title image');
  }
} 