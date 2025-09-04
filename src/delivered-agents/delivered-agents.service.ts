import { Injectable, Inject, NotFoundException, BadRequestException, forwardRef } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { IDeliveredAgent, MaintenanceStatus } from './delivered-agents.schema';
import { DELIVERED_AGENTS_PROVIDER_TOKEN } from './delivered-agents.constants';
import { AgentRequestsService } from 'src/agent-requests/agent-requests.service';
import { AgentRequestStatus } from 'src/agent-requests/agent-requests.constants';
import { IAgentRequest } from 'src/agent-requests/agent-requests.schema';
import { matchFilters } from 'src/app/mongo.utils';

@Injectable()
export class DeliveredAgentsService {
  constructor(
    @Inject(DELIVERED_AGENTS_PROVIDER_TOKEN)
    private deliveredAgentModel: Model<IDeliveredAgent>,
    @Inject(forwardRef(() => AgentRequestsService))
    private agentRequestsService: AgentRequestsService,
  ) {}

  async handleAgentDelivery(agentRequest, user: { userId?: ObjectId }) {
    // Check if already delivered
    const existingDelivered = await this.deliveredAgentModel.findOne({
      agent_request_id: agentRequest._id
    });

    if (existingDelivered) {
      throw new BadRequestException('Agent request already delivered');
    }

    // Set default request time frame
    const requestTimeFrame = 1;

    const deliveredAgent = new this.deliveredAgentModel({
      agent_request_id: agentRequest._id,
      agent_id: agentRequest.agent_id,
      title: agentRequest.title,
      description: agentRequest.description,
      display_description: agentRequest.display_description,
      image: agentRequest.image,
      company_id: agentRequest.company_id,
      company_owner_id: agentRequest.company_owner_id,
      agent_assistant_id: agentRequest['agent_id']['assistant_id'],
      maintenance_status: MaintenanceStatus.ACTIVE,
      pricing: {
        installation_price: agentRequest.pricing.installation_price,
        subscription_price: agentRequest.pricing.subscription_price
      },
      request_time_frame: requestTimeFrame,
      invoice: {
        installation_price: agentRequest.invoice.installation_price,
        subscription_price: agentRequest.invoice.subscription_price,
        grand_total: agentRequest.invoice.grand_total,
        request_time_frame: requestTimeFrame
      },
      created_by: user.userId
    });

    return await deliveredAgent.save();
  }

  async getPaginatedDeliveredAgents(
    rpp: number,
    page: number,
    filter: Object,
    orderBy,
    user: { userId?: ObjectId, company_id?: ObjectId }
  ) {

    const newFilter = matchFilters(filter);
    if (user?.company_id) {
      newFilter['company_id'] = user.company_id;
    }

    const skip: number = (page - 1) * rpp;
    const totalDocuments: number = await this.deliveredAgentModel.countDocuments(newFilter);
    const totalPages: number = Math.ceil(totalDocuments / rpp);
    page = page > totalPages ? totalPages : page;

    const deliveredAgents = await this.deliveredAgentModel.aggregate([
      { $match: newFilter },
      {
        $lookup: {
          from: 'agents',
          localField: 'agent_id',
          foreignField: '_id',
          as: 'agent_id'
        }
      },
      { $unwind: { path: '$agent_id', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'created_by',
          foreignField: '_id',
          pipeline: [
            { $project: { first_name: 1, last_name: 1, email: 1, image: 1, roles: 1 } }
          ],
          as: 'created_by'
        }
      },
      { $unwind: { path: '$created_by', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'updated_by',
          foreignField: '_id',
          pipeline: [
            { $project: { first_name: 1, last_name: 1, email: 1, image: 1, roles: 1 } }
          ],
          as: 'updated_by'
        }
      },
      { $unwind: { path: '$updated_by', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'companies',
          localField: 'company_id',
          foreignField: '_id',
          as: 'company_id'
        }
      },
      { $unwind: { path: '$company_id', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'company_owner_id',
          foreignField: '_id',
          pipeline: [
            { $project: { first_name: 1, last_name: 1, email: 1, image: 1, roles: 1 } }
          ],
          as: 'company_owner_id'
        }
      },
      { $unwind: { path: '$company_owner_id', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'agent_requests',
          localField: 'agent_request_id',
          foreignField: '_id',
          as: 'agent_request_id'
        }
      },
      { $unwind: { path: '$agent_request_id', preserveNullAndEmptyArrays: true } },
      { $sort: orderBy },
      { $skip: skip },
      { $limit: rpp }
    ]);



    return {
      pages: `Page ${page} of ${totalPages}`,
      current_page: page,
      total_pages: totalPages,
      total_records: totalDocuments,
      data: deliveredAgents
    };
  }

  async getTaggedDeliveredAgents(
    user: { userId?: ObjectId, company_id?: ObjectId }
  ) {
    const filter: any = { is_deleted: false };
    if (user?.company_id) {
      filter['company_id'] = user.company_id;
    }


    return await this.deliveredAgentModel
      .find({...filter,maintenance_status:MaintenanceStatus.ACTIVE})
    
   
  }

  async getFilteredDeliveredAgents(
    filter: Object,
    orderBy,
    user: { userId?: ObjectId, company_id?: ObjectId }
  ) {

    const newFilter = matchFilters(filter);
    if (user?.company_id) {
      newFilter['company_id'] = user.company_id;
    }


    const deliveredAgents = await this.deliveredAgentModel.aggregate([
      { $match: newFilter },
      {
        $lookup: {
          from: 'agents',
          localField: 'agent_id',
          foreignField: '_id',
          as: 'agent_id'
        }
      },
      { $unwind: { path: '$agent_id', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'created_by',
          foreignField: '_id',
          pipeline: [
            { $project: { first_name: 1, last_name: 1, email: 1, image: 1, roles: 1 } }
          ],
          as: 'created_by'
        }
      },
      { $unwind: { path: '$created_by', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'updated_by',
          foreignField: '_id',
          pipeline: [
            { $project: { first_name: 1, last_name: 1, email: 1, image: 1, roles: 1 } }
          ],
          as: 'updated_by'
        }
      },
      { $unwind: { path: '$updated_by', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'companies',
          localField: 'company_id',
          foreignField: '_id',
          as: 'company_id'
        }
      },
      { $unwind: { path: '$company_id', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'company_owner_id',
          foreignField: '_id',
          pipeline: [
            { $project: { first_name: 1, last_name: 1, email: 1, image: 1, roles: 1 } }
          ],
          as: 'company_owner_id'
        }
      },
      { $unwind: { path: '$company_owner_id', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'agent_requests',
          localField: 'agent_request_id',
          foreignField: '_id',
          as: 'agent_request_id'
        }
      },
      { $unwind: { path: '$agent_request_id', preserveNullAndEmptyArrays: true } },
      { $sort: orderBy },
    
    ]);

    return deliveredAgents;

  }

  async findOne(id: string, user: { company_id?: ObjectId }) {

    const deliveredAgent = await this.deliveredAgentModel.findOne({_id:id,is_deleted:false});
    if(!deliveredAgent){
      throw new NotFoundException('Delivered agent not found');
    }

    const filter: any = { _id: deliveredAgent._id, is_deleted: false };
    if (user.company_id) {
      filter.company_id = user.company_id;
    }

    const deliveredAgents = await this.deliveredAgentModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'agents',
          localField: 'agent_id',
          foreignField: '_id',
          as: 'agent_id'
        }
      },
      { $unwind: { path: '$agent_id', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'created_by',
          foreignField: '_id',
          pipeline: [
            { $project: { first_name: 1, last_name: 1, email: 1, image: 1, roles: 1 } }
          ],
          as: 'created_by'
        }
      },
      { $unwind: { path: '$created_by', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'updated_by',
          foreignField: '_id',
          pipeline: [
            { $project: { first_name: 1, last_name: 1, email: 1, image: 1, roles: 1 } }
          ],
          as: 'updated_by'
        }
      },
      { $unwind: { path: '$updated_by', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'companies',
          localField: 'company_id',
          foreignField: '_id',
          as: 'company_id'
        }
      },
      { $unwind: { path: '$company_id', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'company_owner_id',
          foreignField: '_id',
          pipeline: [
            { $project: { first_name: 1, last_name: 1, email: 1, image: 1, roles: 1 } }
          ],
          as: 'company_owner_id'
        }
      },
      { $unwind: { path: '$company_owner_id', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'agent_requests',
          localField: 'agent_request_id',
          foreignField: '_id',
          as: 'agent_request_id'
        }
      },
      { $unwind: { path: '$agent_request_id', preserveNullAndEmptyArrays: true } },
      { $sort: {created_at: -1} },
    
    ]);

    return deliveredAgents[0];
  }

  async updateMaintenanceStatus(
    id: string, 
    status: MaintenanceStatus, 
    user: { userId?: ObjectId, company_id?: ObjectId }
  ) {
    const filter: any = { _id: id, is_deleted: false };
    if (user.company_id) {
      filter.company_id = user.company_id;
    }

    const deliveredAgent = await this.deliveredAgentModel.findOne(filter);
    if (!deliveredAgent) {
      throw new NotFoundException('Delivered agent not found');
    }

    console.log('status-------',status);  

    return await this.deliveredAgentModel.findByIdAndUpdate(
      {_id: id},
      {
        maintenance_status: status,
        updated_by: user.userId
      },
      { new: true }
    )
    .populate('agent_id')
    .populate('agent_request_id')
    .populate('company_id')
    .populate('created_by', 'first_name last_name image roles')
    .populate('updated_by', 'first_name last_name image roles')
    .populate('company_owner_id', 'first_name last_name image roles');
  }
} 