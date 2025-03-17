import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { IAgent } from './agents.schema';
import { AGENTS_PROVIDER_TOKEN } from './agents.constants';
import { CreateAgentDto } from './dtos/create-agent.dto';
import { UpdateAgentDto } from './dtos/update-agent.dto';

@Injectable()
export class AgentsService {
  constructor(
    @Inject(AGENTS_PROVIDER_TOKEN)
    private agentModel: Model<IAgent>,
  ) {}

  async create(createAgentDto: CreateAgentDto, user: { userId?: ObjectId }) {
    const agent = new this.agentModel({
      ...createAgentDto,
      created_by: user.userId,
    });
    return await agent.save();
  }

  async getPaginatedAgents(rpp: number, page: number, filter: Object, orderBy, user: { userId?: ObjectId }) {
    filter['is_deleted'] = false;

    const skip: number = (page - 1) * rpp;
    const totalDocuments: number = await this.agentModel.countDocuments(filter);
    const totalPages: number = Math.ceil(totalDocuments / rpp);
    page = page > totalPages ? totalPages : page;

    const agents = await this.agentModel
      .find(filter)
      .populate('work_flows.integrations')
      .populate('created_by', 'first_name last_name')
      .populate('updated_by', 'first_name last_name')
      .sort(orderBy)
      .skip(skip)
      .limit(rpp);

    return { 
      pages: `Page ${page} of ${totalPages}`, 
      current_page: page, 
      total_pages: totalPages, 
      total_records: totalDocuments, 
      data: agents 
    };
  }

  async getFilteredAgents(filter: Object, orderBy, user: { userId?: ObjectId }) {
    filter['is_deleted'] = false;

    return await this.agentModel
      .find(filter)
      .populate('work_flows.integrations')
      .populate('created_by', 'first_name last_name')
      .populate('updated_by', 'first_name last_name')
      .sort(orderBy);
  }

  async findOne(id: string) {
    const agent = await this.agentModel
      .findOne({ _id: id, is_deleted: false })
      .populate('work_flows.integrations')
      .populate('created_by', 'first_name last_name')
      .populate('updated_by', 'first_name last_name');

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return agent;
  }

  async update(id: string, updateAgentDto: UpdateAgentDto, user: { userId?: ObjectId }) {
    const agent = await this.agentModel.findOne({ _id: id, is_deleted: false });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return await this.agentModel.findByIdAndUpdate(
      id,
      {
        ...updateAgentDto,
        updated_by: user.userId,
      },
      { new: true }
    );
  }

  async remove(id: string, user: { userId?: ObjectId }) {
    const agent = await this.agentModel.findOne({ _id: id, is_deleted: false });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return await this.agentModel.findByIdAndUpdate(
      id,
      {
        is_deleted: true,
        updated_by: user.userId,
      },
      { new: true }
    );
  }
} 