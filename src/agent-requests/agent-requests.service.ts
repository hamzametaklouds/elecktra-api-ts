import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { IAgentRequest } from './agent-requests.schema';
import { AGENT_REQUESTS_PROVIDER_TOKEN } from './agent-requests.constants';
import { CreateAgentRequestDto } from './dtos/create-agent-request.dto';
import { UpdateAgentRequestDto } from './dtos/update-agent-request.dto';
import { AgentsService } from 'src/agents/agents.service';
import { AgentRequestStatus } from './agent-requests.constants';
import { CompanyService } from 'src/company/company.service';
@Injectable()
export class AgentRequestsService {
  constructor(
    @Inject(AGENT_REQUESTS_PROVIDER_TOKEN)
    private agentRequestModel: Model<IAgentRequest>,
    private agentsService: AgentsService,
    private companyService: CompanyService,
  ) {}

  async create(createAgentRequestDto: CreateAgentRequestDto, user: { userId?: ObjectId, companyId?: ObjectId }) {
    // Get agent details
    const agent = await this.agentsService.findOne(createAgentRequestDto.agent_id.toString());
    if (!agent) {
      throw new BadRequestException('Agent not found');
    }

    const company = await this.companyService.findOne(user.companyId.toString());
    if (!company) {
      throw new BadRequestException('Company not found');
    }

    // Validate and get selected workflows with their integrations
    const selectedWorkflows = agent.work_flows.filter(agentWorkflow => 
      createAgentRequestDto.work_flows.some(requestWorkflow => 
        requestWorkflow.workflow_id.toString() === agentWorkflow._id.toString()
      )
    ).map(workflow => {
      console.log('workflow----',workflow);
      // Find the corresponding request workflow to get selected integrations
      const requestWorkflow = createAgentRequestDto.work_flows.find(
        rw => rw.workflow_id.toString() === workflow._id.toString()
      );

      console.log('requestWorkflow----',requestWorkflow);
      console.log('workflow----',workflow);
      // Filter and validate selected integrations for this workflow
      const selectedIntegrations = workflow.integrations.filter(integration =>
        requestWorkflow.integration_ids.some(id => 
          id.toString() == integration.toString()
        )
      );

      console.log('selectedIntegrations----',selectedIntegrations);
      // Validate if all requested integration IDs exist in the workflow
    //   if (selectedIntegrations.length !== requestWorkflow.integration_ids.length) {
    //     throw new BadRequestException(
    //       `Invalid integration IDs provided for workflow: ${workflow.title}`
    //     );
    //   }

      // Return workflow with only selected integrations
      return {
        ...workflow,
        integrations: selectedIntegrations
      };
    });

    // Validate if all requested workflow IDs exist
    if (selectedWorkflows.length !== createAgentRequestDto.work_flows.length) {
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
      company_id: company._id,
      company_owner_id: company.created_by,
      status: AgentRequestStatus.PENDING_CREDENTIALS,
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

  async getPaginatedRequests(rpp: number, page: number, filter: Object, orderBy, user: { userId?: ObjectId }) {
    filter['is_deleted'] = false;

    const skip: number = (page - 1) * rpp;
    const totalDocuments: number = await this.agentRequestModel.countDocuments(filter);
    const totalPages: number = Math.ceil(totalDocuments / rpp);
    page = page > totalPages ? totalPages : page;

    const requests = await this.agentRequestModel
      .find(filter)
      .populate('agent_id')
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
      data: requests 
    };
  }

  async getFilteredRequests(filter: Object, orderBy, user: { userId?: ObjectId }) {
    filter['is_deleted'] = false;

    return await this.agentRequestModel
      .find(filter)
      .populate('agent_id')
      .populate('created_by', 'first_name last_name')
      .populate('updated_by', 'first_name last_name')
      .sort(orderBy);
  }

  async findOne(id: string) {
    const request = await this.agentRequestModel
      .findOne({ _id: id, is_deleted: false })
      .populate('agent_id')
      .populate('created_by', 'first_name last_name')
      .populate('updated_by', 'first_name last_name');

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

    return await this.agentRequestModel.findByIdAndUpdate(
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