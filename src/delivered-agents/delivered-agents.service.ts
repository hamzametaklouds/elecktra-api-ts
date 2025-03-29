import { Injectable, Inject, NotFoundException, BadRequestException, forwardRef } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { IDeliveredAgent, MaintenanceStatus } from './delivered-agents.schema';
import { DELIVERED_AGENTS_PROVIDER_TOKEN } from './delivered-agents.constants';
import { AgentRequestsService } from 'src/agent-requests/agent-requests.service';
import { AgentRequestStatus } from 'src/agent-requests/agent-requests.constants';
import { IAgentRequest } from 'src/agent-requests/agent-requests.schema';

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

    // Calculate workflow totals
    const workflowsTotal = agentRequest.work_flows.reduce((sum, workflow) => sum + workflow.price, 0);
    const workflowsInstallationTotal = agentRequest.work_flows.reduce(
      (sum, workflow) => sum + workflow.installation_price, 
      0
    );

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
      work_flows: agentRequest.work_flows.map(workflow => ({
        ...workflow,
        weeks: workflow.weeks,
        installation_price: workflow.installation_price
      })),
      invoice: {
        workflows_total: workflowsTotal,
        workflows_installation_total: workflowsInstallationTotal,
        installation_price: agentRequest.invoice.installation_price,
        subscription_price: agentRequest.invoice.subscription_price,
        grand_total: agentRequest.invoice.grand_total
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
    if (user?.company_id) {
      filter['company_id'] = user.company_id;
    }

    const skip: number = (page - 1) * rpp;
    const totalDocuments: number = await this.deliveredAgentModel.countDocuments(filter);
    const totalPages: number = Math.ceil(totalDocuments / rpp);
    page = page > totalPages ? totalPages : page;

    const deliveredAgents = await this.deliveredAgentModel
      .find(filter)
      .populate('agent_id')
      .populate('company_id')
      .populate('agent_request_id')
      .populate('created_by', 'first_name last_name image roles')
      .populate('updated_by', 'first_name last_name image roles')
      .populate('company_owner_id', 'first_name last_name image roles')
      .sort(orderBy)
      .skip(skip)
      .limit(rpp);

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
      .find(filter)
    
   
  }

  async getFilteredDeliveredAgents(
    filter: Object,
    orderBy,
    user: { userId?: ObjectId, company_id?: ObjectId }
  ) {
    if (user?.company_id) {
      filter['company_id'] = user.company_id;
    }


    return await this.deliveredAgentModel
      .find({...filter,maintenance_status:MaintenanceStatus.ACTIVE})
      .populate('agent_id')
      .populate('agent_request_id')
      .populate('company_id')
      .populate('created_by', 'first_name last_name image roles')
      .populate('updated_by', 'first_name last_name image roles')
      .populate('company_owner_id', 'first_name last_name image roles')
      .sort(orderBy);
  }

  async findOne(id: string, user: { company_id?: ObjectId }) {
    const filter: any = { _id: id, is_deleted: false };
    if (user.company_id) {
      filter.company_id = user.company_id;
    }

    const deliveredAgent = await this.deliveredAgentModel
      .findOne(filter)
      .populate('agent_id')
      .populate('agent_request_id')
      .populate('company_id')
      .populate('created_by', 'first_name last_name image roles')
      .populate('updated_by', 'first_name last_name image roles')
      .populate('company_owner_id', 'first_name last_name image roles');

    if (!deliveredAgent) {
      throw new NotFoundException('Delivered agent not found');
    }

    return deliveredAgent;
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