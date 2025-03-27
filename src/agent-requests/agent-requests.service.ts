import { Injectable, Inject, NotFoundException, BadRequestException, forwardRef } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { IAgentRequest } from './agent-requests.schema';
import { AGENT_REQUESTS_PROVIDER_TOKEN } from './agent-requests.constants';
import { CreateAgentRequestDto } from './dtos/create-agent-request.dto';
import { UpdateAgentRequestDto } from './dtos/update-agent-request.dto';
import { AgentsService } from 'src/agents/agents.service';
import { AgentRequestStatus } from './agent-requests.constants';
import { CompanyService } from 'src/company/company.service';
import { DeliveredAgentsService } from 'src/delivered-agents/delivered-agents.service';

@Injectable()
export class AgentRequestsService {
  constructor(
    @Inject(AGENT_REQUESTS_PROVIDER_TOKEN)
    private agentRequestModel: Model<IAgentRequest>,
    private agentsService: AgentsService,
    @Inject(forwardRef(() => CompanyService))
    private companyService: CompanyService,
    @Inject(forwardRef(() => DeliveredAgentsService))
    private deliveredAgentsService: DeliveredAgentsService,
  ) {}

  async create(createAgentRequestDto: CreateAgentRequestDto, user: { userId?: ObjectId, company_id?: ObjectId }) {
    // Get agent details
    const agent = await this.agentsService.findOne(createAgentRequestDto.agent_id.toString());
    if (!agent) {
      throw new BadRequestException('Agent not found');
    }

    let company = null;

    if(user?.company_id){  
      company = await this.companyService.findOne(user?.company_id);
      if (!company) {
        throw new BadRequestException('Company not found');
      }
    }

    // Validate and get selected workflows with all their integrations
    const selectedWorkflows = agent.work_flows.filter(agentWorkflow => 
      createAgentRequestDto.workflow_ids.some(workflowId => 
        workflowId.toString() === agentWorkflow._id.toString()
      )
    );

    // Validate if all requested workflow IDs exist
    if (selectedWorkflows.length !== createAgentRequestDto.workflow_ids.length) {
      throw new BadRequestException('Invalid workflow IDs provided');
    }

    // Calculate totals
    const workflowsTotal = selectedWorkflows.reduce((sum, workflow) => sum + workflow.price, 0);
    const grandTotal = workflowsTotal + agent.pricing.installation_price + agent.pricing.subscription_price;

    // Create agent request with cloned data
    const agentRequest = new this.agentRequestModel({
      agent_id: agent._id,
      title: agent.title,
      sub_title: agent.sub_title,
      description: agent.description,
      display_description: agent.display_description,
      request_time_frame: agent.request_time_frame,
      image: agent.image,
      agent_assigned_id: agent.assistant_id,
      company_id: company?._id || null,
      company_owner_id: company?.created_by || null,
      status: AgentRequestStatus.SUBMITTED,
      pricing: agent.pricing,
      work_flows: selectedWorkflows,
      invoice: {
        workflows_total: workflowsTotal,
        installation_price: agent.pricing.installation_price,
        subscription_price: agent.pricing.subscription_price,
        grand_total: grandTotal
      },
      created_by: user.userId,
    });

    return await agentRequest.save();
  }

  async getPaginatedRequests(rpp: number, page: number, filter: Object, orderBy, user: { userId?: ObjectId, company_id?: ObjectId }) {
    filter['is_deleted'] = false;

    if(user.company_id) {
      filter['company_id'] = user.company_id;
    }

    const skip: number = (page - 1) * rpp;
    const totalDocuments: number = await this.agentRequestModel.countDocuments(filter);
    const totalPages: number = Math.ceil(totalDocuments / rpp);
    page = page > totalPages ? totalPages : page;

    const requests = await this.agentRequestModel
      .find(filter)
      .populate('agent_id')
      .populate('created_by', 'first_name last_name email image roles')
      .populate('updated_by', 'first_name last_name email image roles')
      .populate('company_owner_id', 'first_name last_name email image roles')
      .sort(orderBy)
      .skip(skip)
      .limit(rpp);

    return { 
      pages: `Page ${page} of ${totalPages}`, 
      current_page: page, 
      total_pages: totalPages, 
      total_records: totalDocuments, 
      data: requests 
    };
  }

  async getFilteredRequests(filter: Object, orderBy, user: { userId?: ObjectId, company_id?: ObjectId }) {
    filter['is_deleted'] = false;

    if(user.company_id) {
      filter['company_id'] = user.company_id;
    }

    return await this.agentRequestModel
      .find(filter)
      .populate('agent_id')
      .populate('created_by', 'first_name last_name email image roles')
      .populate('updated_by', 'first_name last_name email image roles')
      .populate('company_owner_id', 'first_name last_name email image roles')
      .sort(orderBy);
  }

  async findOne(id: string) {
    const request = await this.agentRequestModel
      .findOne({ _id: id, is_deleted: false })
      .populate('agent_id')
      .populate('created_by', 'first_name last_name email image roles')
      .populate('updated_by', 'first_name last_name email image roles')
      .populate('company_owner_id', 'first_name last_name email image roles')
      .populate('company_id');

    if (!request) {
      throw new NotFoundException('Agent request not found');
    }
    return request;
  }

  async update(id: string, updateAgentRequestDto: UpdateAgentRequestDto, user: { userId?: ObjectId }) {
    const request = await this.agentRequestModel.findOne({ _id: id, is_deleted: false });
    if (!request) {
      throw new NotFoundException('Agent request not found');
    }

   
    let updatedRequest = await this.agentRequestModel.findByIdAndUpdate(
      id,
      {
        ...updateAgentRequestDto,
        updated_by: user.userId,
      },
      { new: true }
    )
    .populate('agent_id')
    .populate('created_by', 'first_name last_name')
    .populate('updated_by', 'first_name last_name');

    // If status is changed to DELIVERED, create delivered agent
    if (updateAgentRequestDto.status === AgentRequestStatus.DELIVERED) {
      updateAgentRequestDto['agent_assigned_id'] = request?.agent_assigned_id;
     
      await this.deliveredAgentsService.handleAgentDelivery(updatedRequest, user);
    }

    return updatedRequest;
  }

  async remove(id: string, user: { userId?: ObjectId }) {
    const request = await this.agentRequestModel.findOne({ _id: id, is_deleted: false });
    if (!request) {
      throw new NotFoundException('Agent request not found');
    }

    return await this.agentRequestModel.findByIdAndUpdate(
      id,
      {
        is_deleted: true,
        updated_by: user.userId,
      },
      { new: true }
    )
    .populate('agent_id')
    .populate('created_by', 'first_name last_name')
    .populate('updated_by', 'first_name last_name');
  }
} 