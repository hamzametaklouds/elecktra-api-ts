import { Injectable, Inject, NotFoundException, BadRequestException, forwardRef } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { IAgent, AgentStatus } from './agents.schema';
import { AGENTS_PROVIDER_TOKEN } from './agents.constants';
import { CreateAgentDto } from './dtos/create-agent.dto';
import { UpdateAgentDto } from './dtos/update-agent.dto';
import { UpdateAgentBasicDto } from './dtos/update-agent-basic.dto';
import { UpdateAgentToolsDto } from './dtos/update-agent-tools.dto';
import { UpdateAgentAssignmentDto } from './dtos/update-agent-assignment.dto';
import { CreateAgentWizardDto } from './dtos/create-agent-wizard.dto';
import { ToolsService } from '../tools/tools.service';
import { InvitationsService } from '../invitations/invitations.service';
import { TagsService } from '../tags/tags.service';

@Injectable()
export class AgentsService {
  constructor(
    @Inject(AGENTS_PROVIDER_TOKEN)
    private agentModel: Model<IAgent>,
    private toolsService: ToolsService,
    @Inject(forwardRef(() => InvitationsService))
    private invitationsService: InvitationsService,
    private tagsService: TagsService,
  ) {}

  async create(createAgentDto: CreateAgentDto, user: { userId?: ObjectId, company_id?: ObjectId }) {
    // Check title uniqueness within company
    await this.checkTitleUniqueness(createAgentDto.title, user.company_id?.toString());

    // Process tags if provided
    let processedTags: ObjectId[] = [];
    if (createAgentDto.tags && createAgentDto.tags.length > 0) {
      processedTags = await this.tagsService.processTagsArray(createAgentDto.tags, user);
    }

    const agent = new this.agentModel({
      ...createAgentDto,
      status: AgentStatus.DRAFT,
      company_id: user.company_id,
      created_by: user.userId,
      tags: processedTags,
    });
    return await agent.save();
  }

  async getPaginatedAgents(rpp: number, page: number, filter: Object, orderBy, user: { userId?: ObjectId, company_id?: ObjectId }) {
    filter['is_deleted'] = false;
    if (!filter['status']) {
      filter['status'] = { $ne: AgentStatus.TERMINATED };
    }

    if(user?.company_id){
      filter['is_disabled'] = false;
    }

    const skip: number = (page - 1) * rpp;
    const totalDocuments: number = await this.agentModel.countDocuments(filter);
    const totalPages: number = Math.ceil(totalDocuments / rpp);
    page = page > totalPages ? totalPages : page;

    const agents = await this.agentModel
      .find(filter)
      .populate({
        path: 'work_flows.integrations',
        select: '_id title api_key_required',
        match: { is_deleted: false }
      })
      .populate({
        path: 'created_by',
        select: 'first_name last_name image roles'
      })
      .populate({
        path: 'updated_by',
        select: 'first_name last_name image roles'
      })
      .populate('tags', 'name color description')
      .populate('client_id', 'first_name last_name email')
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

  async getFilteredAgents(filter: Object, orderBy, user: { userId?: ObjectId, company_id?: ObjectId }) {
    filter['is_deleted'] = false;
    if (!filter['status']) {
      filter['status'] = { $ne: AgentStatus.TERMINATED };
    }


    if(user?.company_id){
      filter['is_disabled'] = false;
    }


    return await this.agentModel
      .find(filter)
      .populate({
        path: 'work_flows.integrations',
        select: '_id title api_key_required',
        match: { is_deleted: false }
      })
      .populate({
        path: 'created_by',
        select: 'first_name last_name'
      })
      .populate({
        path: 'updated_by',
        select: 'first_name last_name'
      })
      .populate('tags', 'name color description')
      .populate('client_id', 'first_name last_name email')
      .sort(orderBy);
  }

  async findOne(id: string) {
    const agent = await this.agentModel
      .findOne({ _id: id, is_deleted: false })
      .populate({
        path: 'work_flows.integrations',
        match: { is_deleted: false },
        select: '_id title api_key_required'
      })
      .populate('created_by', 'first_name last_name')
      .populate('updated_by', 'first_name last_name')
      .populate('tags', 'name color description')
      .populate('client_id', 'first_name last_name email');

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return agent;
  }

  async update(id: string, updateAgentDto: UpdateAgentDto, user: { userId?: ObjectId }) {
    const agent = await this.agentModel.findOne({ 
      _id: id, 
      is_deleted: false 
    });
    
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
    )
    .populate({
      path: 'work_flows.integrations',
      select: '_id title api_key_required',
      match: { is_deleted: false }
    })
    .populate({
      path: 'created_by',
      select: 'first_name last_name'
    })
    .populate({
      path: 'updated_by',
      select: 'first_name last_name'
    })
    .populate('tags', 'name color description')
    .populate('client_id', 'first_name last_name email');
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
        status: AgentStatus.TERMINATED,
        updated_by: user.userId,
      },
      { new: true }
    )
    .populate({
      path: 'work_flows.integrations',
      select: '_id title api_key_required',
      match: { is_deleted: false }
    }    )
    .populate({
      path: 'created_by',
      select: 'first_name last_name'
    })
    .populate({
      path: 'updated_by',
      select: 'first_name last_name'
    })
    .populate('tags', 'name color description')
    .populate('client_id', 'first_name last_name email');
  }

  // Wizard Methods

  /**
   * Step 1: Update basic agent information
   */
  async updateAgentBasic(id: string, updateDto: UpdateAgentBasicDto, user: { userId?: ObjectId, company_id?: ObjectId }) {
    const agent = await this.findOne(id);
    
    // Check if user has access to this agent
    if (user.company_id && agent.company_id?.toString() !== user.company_id.toString()) {
      throw new BadRequestException('You do not have access to this agent');
    }

    // Check title uniqueness if title is being updated
    if (updateDto.title && updateDto.title !== agent.title) {
      await this.checkTitleUniqueness(updateDto.title, user.company_id?.toString(), id);
    }

    // Process tags if provided
    let processedTags: ObjectId[] = [];
    if (updateDto.tags && updateDto.tags.length > 0) {
      processedTags = await this.tagsService.processTagsArray(updateDto.tags, user);
    }

    const updateData: any = {
      ...updateDto,
      updated_by: user.userId,
    };

    if (processedTags.length > 0) {
      updateData.tags = processedTags;
    }

    return await this.agentModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    .populate('company_id', 'name')
    .populate('created_by', 'first_name last_name')
    .populate('updated_by', 'first_name last_name')
    .populate('tags', 'name color description')
    .populate('client_id', 'first_name last_name email');
  }

  /**
   * Step 2: Update agent tools selection
   */
  async updateAgentTools(id: string, updateDto: UpdateAgentToolsDto, user: { userId?: ObjectId, company_id?: ObjectId }) {
    const agent = await this.findOne(id);
    
    // Check if user has access to this agent
    if (user.company_id && agent.company_id?.toString() !== user.company_id.toString()) {
      throw new BadRequestException('You do not have access to this agent');
    }

    // Validate that all tools exist and are enabled
    const isValid = await this.toolsService.validateTools(updateDto.tools_selected);
    if (!isValid) {
      throw new BadRequestException('One or more selected tools are invalid or disabled');
    }

    const updatedAgent = await this.agentModel.findByIdAndUpdate(
      id,
      {
        tools_selected: updateDto.tools_selected,
        tools_count: updateDto.tools_selected.length,
        updated_by: user.userId,
      },
      { new: true }
    )
    .populate('tools_selected', 'key title icon_url category')
    .populate('company_id', 'name')
    .populate('created_by', 'first_name last_name')
    .populate('updated_by', 'first_name last_name');

    return updatedAgent;
  }

  /**
   * Step 3: Update agent assignment and send invitations
   */
  async updateAgentAssignment(id: string, updateDto: UpdateAgentAssignmentDto, user: { userId?: ObjectId, company_id?: ObjectId }) {
    const agent = await this.findOne(id);
    
    // Check if user has access to this agent
    if (user.company_id && agent.company_id?.toString() !== user.company_id.toString()) {
      throw new BadRequestException('You do not have access to this agent');
    }

    const updateData: any = {
      updated_by: user.userId,
    };

    if (updateDto.client_id) {
      updateData.client_id = updateDto.client_id;
      // Set client_name to null initially, will be populated by the populate
      updateData.client_name = null;
    }

    // Update agent
    const updatedAgent = await this.agentModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    .populate('client_id', 'first_name last_name email')
    .populate('company_id', 'name')
    .populate('created_by', 'first_name last_name')
    .populate('updated_by', 'first_name last_name');

    // Send invitations if provided
    const invitations = [];
    if (updateDto.invitees && updateDto.invitees.length > 0) {
      for (const invitee of updateDto.invitees) {
        try {
          const invitation = await this.invitationsService.createOrReuseInvite({
            email: invitee.email,
            role: invitee.role,
            agent_id: id,
            company_id: user.company_id?.toString(),
            invitee_name: invitee.name,
            created_by: user.userId?.toString(),
          });
          
          // Update invitation with created_by - will be handled in the invitations service

          invitations.push(invitation);
        } catch (error) {
          console.error(`Failed to create invitation for ${invitee.email}:`, error);
        }
      }
    }

    return {
      agent: updatedAgent,
      invitations
    };
  }

  /**
   * Step 4: Integrate agent (finalize and activate)
   */
  async integrateAgent(id: string, user: { userId?: ObjectId, company_id?: ObjectId }) {
    const agent = await this.findOne(id);
    
    // Check if user has access to this agent
    if (user.company_id && agent.company_id?.toString() !== user.company_id.toString()) {
      throw new BadRequestException('You do not have access to this agent');
    }

    // Business rule validations
    if (agent.status !== AgentStatus.DRAFT && agent.status !== AgentStatus.MAINTENANCE) {
      throw new BadRequestException('Agent must be in Draft or Maintenance status to integrate');
    }

    if (!agent.tools_selected || agent.tools_selected.length === 0) {
      throw new BadRequestException('Agent must have at least one tool selected to integrate');
    }

    // Update status to Active
    const updatedAgent = await this.agentModel.findByIdAndUpdate(
      id,
      {
        status: AgentStatus.ACTIVE,
        updated_by: user.userId,
      },
      { new: true }
    )
    .populate('tools_selected', 'key title icon_url category')
    .populate('client_id', 'first_name last_name email')
    .populate('company_id', 'name')
    .populate('created_by', 'first_name last_name')
    .populate('updated_by', 'first_name last_name');

    // Get related invitations
    const invitations = await this.invitationsService.getInvitationsByAgentId(id);

    return {
      agent: updatedAgent,
      invitations
    };
  }

  /**
   * Unified method: Create agent with complete wizard data in one step
   */
  async createAgentComplete(createDto: CreateAgentWizardDto, user: { userId?: ObjectId, company_id?: ObjectId }) {
    // Step 1: Create agent with basic information
    const agentData: CreateAgentDto = {
      title: createDto.title || 'New Agent',
      description: createDto.description || 'Agent created via unified wizard',
      display_description: createDto.display_description || 'Agent created via unified wizard',
      service_type: createDto.service_type || 'general',
      assistant_id: createDto.assistant_id,
      image: createDto.image,
      pricing: { installation_price: 0, subscription_price: 0 },
      work_flows: []
    };

    // Check title uniqueness within company
    await this.checkTitleUniqueness(agentData.title, user.company_id?.toString());

    // Process tags if provided
    let processedTags: ObjectId[] = [];
    if (createDto.tags && createDto.tags.length > 0) {
      processedTags = await this.tagsService.processTagsArray(createDto.tags, user);
    }

    // Create the agent
    const agent = new this.agentModel({
      ...agentData,
      status: AgentStatus.DRAFT,
      company_id: user.company_id,
      created_by: user.userId,
      tags: processedTags,
    });
    
    const savedAgent = await agent.save();

    // Step 2: Update tools selection (required)
    // Validate that all tools exist and are enabled
    const isValid = await this.toolsService.validateTools(createDto.tools_selected);
    if (!isValid) {
      throw new BadRequestException('One or more selected tools are invalid or disabled');
    }

    // Update agent with tools
    await this.agentModel.findByIdAndUpdate(
      savedAgent._id,
      {
        tools_selected: createDto.tools_selected,
        tools_count: createDto.tools_selected.length,
        updated_by: user.userId,
      }
    );

    // Step 3: Update assignment and send invitations (optional)
    const updateData: any = {
      updated_by: user.userId,
    };

    if (createDto.client_id) {
      updateData.client_id = createDto.client_id;
      // Set client_name to null initially, will be populated by the populate
      updateData.client_name = null;
    }

    // Update agent with assignment
    await this.agentModel.findByIdAndUpdate(
      savedAgent._id,
      updateData
    );

    // Send invitations if provided
    const invitations = [];
    if (createDto.invitees && createDto.invitees.length > 0) {
      for (const invitee of createDto.invitees) {
        try {
          const invitation = await this.invitationsService.createOrReuseInvite({
            email: invitee.email,
            role: invitee.role,
            agent_id: savedAgent._id.toString(),
            company_id: user.company_id?.toString(),
            invitee_name: invitee.name,
            created_by: user.userId?.toString(),
          });
          
          invitations.push(invitation);
        } catch (error) {
          console.error(`Failed to create invitation for ${invitee.email}:`, error);
        }
      }
    }

    // Step 4: Integration (optional - controlled by auto_integrate flag)
    let finalStatus = AgentStatus.DRAFT;
    if (createDto.auto_integrate) {
      // Business rule validations for integration
      if (createDto.tools_selected && createDto.tools_selected.length > 0) {
        finalStatus = AgentStatus.ACTIVE;
        await this.agentModel.findByIdAndUpdate(
          savedAgent._id,
          {
            status: AgentStatus.ACTIVE,
            updated_by: user.userId,
          }
        );
      } else {
        throw new BadRequestException('Agent must have at least one tool selected to auto-integrate');
      }
    }

    // Return final agent with all populated data
    const finalAgent = await this.agentModel.findById(savedAgent._id)
      .populate('tools_selected', 'key title icon_url category')
      .populate('client_id', 'first_name last_name email')
      .populate('company_id', 'name')
      .populate('created_by', 'first_name last_name')
      .populate('updated_by', 'first_name last_name')
      .populate('tags', 'name color description');

    return {
      agent: finalAgent,
      invitations,
      status: finalStatus,
      message: createDto.auto_integrate && finalStatus === AgentStatus.ACTIVE 
        ? 'Agent created and integrated successfully' 
        : 'Agent created successfully. Manual integration required to activate.'
    };
  }

  /**
   * Get detailed agent with tools and invitations
   */
  async getAgentDetails(id: string, user: { userId?: ObjectId, company_id?: ObjectId }) {
    const agent = await this.agentModel
      .findOne({ _id: id, is_deleted: false })
      .populate('tools_selected', 'key title icon_url category enabled')
      .populate('client_id', 'first_name last_name email')
      .populate('company_id', 'name')
      .populate('created_by', 'first_name last_name')
      .populate('updated_by', 'first_name last_name')
      .populate('tags', 'name color description');

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // Check if user has access to this agent
    if (user.company_id && agent.company_id?.toString() !== user.company_id.toString()) {
      throw new BadRequestException('You do not have access to this agent');
    }

    // Get related invitations
    const invitations = await this.invitationsService.getInvitationsByAgentId(id);

    return {
      ...agent.toObject(),
      invitations
    };
  }

  /**
   * Enhanced search with filters for status, tags, tools
   */
  async searchAgents(params: {
    q?: string;
    status?: string[];
    tags?: string[];
    tools?: string[];
    limit?: number;
    cursor?: string;
    user: { userId?: ObjectId, company_id?: ObjectId };
  }) {
    const { q, status, tags, tools, limit = 20, cursor, user } = params;
    
    const filter: any = { is_deleted: false };
    
    // Apply company filter for business users
    if (user.company_id) {
      filter.company_id = user.company_id;
      filter.is_disabled = false;
    }

    // Text search
    if (q) {
      filter.$text = { $search: q };
    }

    // Status filter
    if (status && status.length > 0) {
      filter.status = { $in: status };
    }

    // Tags filter
    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    // Tools filter
    if (tools && tools.length > 0) {
      filter.tools_selected = { $in: tools };
    }

    // Cursor pagination
    if (cursor) {
      filter._id = { $gt: cursor };
    }

    const agents = await this.agentModel
      .find(filter)
      .populate('tools_selected', 'key title icon_url category')
      .populate('company_id', 'name')
      .populate('created_by', 'first_name last_name')
      .populate('tags', 'name color description')
      .sort({ _id: 1 })
      .limit(limit + 1); // Get one extra to check if there are more

    const hasMore = agents.length > limit;
    if (hasMore) {
      agents.pop(); // Remove the extra item
    }

    const nextCursor = hasMore && agents.length > 0 ? agents[agents.length - 1]._id : null;

    return {
      data: agents,
      hasMore,
      nextCursor
    };
  }

  /**
   * Helper method to check title uniqueness within company
   */
  private async checkTitleUniqueness(title: string, companyId?: string, excludeId?: string) {
    const filter: any = {
      normalized_title: title.toLowerCase().trim(),
      is_deleted: false,
    };

    if (companyId) {
      filter.company_id = companyId;
    }

    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    const existingAgent = await this.agentModel.findOne(filter);
    if (existingAgent) {
      throw new BadRequestException(`Agent with title '${title}' already exists in this workspace`);
    }
  }
} 