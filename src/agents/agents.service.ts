import { Injectable, Inject, NotFoundException, BadRequestException, forwardRef } from '@nestjs/common';
import { Model, ObjectId, Types } from 'mongoose';
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
import { METERING_PROVIDER_TOKENS } from 'src/modules/metering/metering.model';
import { DailyAgentUsage } from 'src/modules/metering/schemas/daily-agent-usage.schema';
import { AgentPricing } from 'src/modules/metering/schemas/agent-pricing.schema';
import { Invoice } from 'src/modules/metering/schemas/invoice.schema';

@Injectable()
export class AgentsService {
  constructor(
    @Inject(AGENTS_PROVIDER_TOKEN)
    private agentModel: Model<IAgent>,
    private toolsService: ToolsService,
    @Inject(forwardRef(() => InvitationsService))
    private invitationsService: InvitationsService,
    private tagsService: TagsService,
    @Inject(METERING_PROVIDER_TOKENS.DAILY_AGENT_USAGE) private dailyUsageModel: Model<DailyAgentUsage>,
    @Inject(METERING_PROVIDER_TOKENS.AGENT_PRICING) private agentPricingModel: Model<AgentPricing>,
    @Inject(METERING_PROVIDER_TOKENS.INVOICE) private invoiceModel: Model<Invoice>,
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
        path: 'created_by',
        select: 'first_name last_name image roles'
      })
      .populate({
        path: 'updated_by',
        select: 'first_name last_name image roles'
      })
      .populate('tags', 'name color description')
      .populate('client_id', 'first_name last_name email image')
      .populate('tools_selected', 'title description icon_url category is_disabled')
      .sort(orderBy)
      .skip(skip)
      .limit(rpp);

    // Transform agents to add client_name from populated client_id
    const transformedAgents = agents.map(agent => {
      const agentObj = agent.toObject ? agent.toObject() : agent;
      if (agentObj.client_id && typeof agentObj.client_id === 'object' && 'first_name' in agentObj.client_id) {
        const client = agentObj.client_id as any;
        agentObj.client_name = `${client.first_name || ''} ${client.last_name || ''}`.trim();
      }
      return agentObj;
    });

    return { 
      pages: `Page ${page} of ${totalPages}`, 
      current_page: page, 
      total_pages: totalPages, 
      total_records: totalDocuments, 
      data: transformedAgents 
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


    const agents = await this.agentModel
      .find(filter)
      .populate({
        path: 'created_by',
        select: 'first_name last_name'
      })
      .populate({
        path: 'updated_by',
        select: 'first_name last_name'
      })
      .populate('tags', 'name color description')
      .populate('client_id', 'first_name last_name email image')
      .populate('tools_selected', 'title description icon_url category is_disabled')
      .sort(orderBy);

    // Transform agents to add client_name from populated client_id
    const transformedAgents = agents.map(agent => {
      const agentObj = agent.toObject ? agent.toObject() : agent;
      if (agentObj.client_id && typeof agentObj.client_id === 'object' && 'first_name' in agentObj.client_id) {
        const client = agentObj.client_id as any;
        agentObj.client_name = `${client.first_name || ''} ${client.last_name || ''}`.trim();
      }
      return agentObj;
    });

    return transformedAgents;
  }

  async findOne(id: string) {
    const agent = await this.agentModel
      .findOne({ _id: id, is_deleted: false })
      .populate('created_by', 'first_name last_name')
      .populate('updated_by', 'first_name last_name')
      .populate('tags', 'name color description')
      .populate('client_id', 'first_name last_name email image')
      .populate('tools_selected', 'title description icon_url category is_disabled');

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
      path: 'created_by',
      select: 'first_name last_name'
    })
    .populate({
      path: 'updated_by',
      select: 'first_name last_name'
    })
    .populate('tags', 'name color description')
    .populate('client_id', 'first_name last_name email image')
    .populate('tools_selected', 'title description icon_url category is_disabled');
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
      path: 'created_by',
      select: 'first_name last_name'
    })
    .populate({
      path: 'updated_by',
      select: 'first_name last_name'
    })
    .populate('tags', 'name color description')
    .populate('client_id', 'first_name last_name email image')
    .populate('tools_selected', 'title description icon_url category is_disabled');
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
    .populate('client_id', 'first_name last_name email image');
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

    // Convert strings to ObjectIds manually
    const toolsObjectIds = updateDto.tools_selected.map(id => new Types.ObjectId(id));
    const updatedAgent = await this.agentModel.findByIdAndUpdate(
      id,
      {
        tools_selected: toolsObjectIds,
        tools_count: updateDto.tools_selected.length,
        updated_by: user.userId,
      },
      { new: true }
    )
      .populate('tools_selected', 'title description icon_url category is_disabled')
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
    .populate('client_id', 'first_name last_name email image')
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
    .populate('tools_selected', 'title description icon_url category is_disabled')
    .populate('client_id', 'first_name last_name email image')
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
    };

 
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

    // Update agent with tools - convert strings to ObjectIds manually
    const toolsObjectIds = createDto.tools_selected.map(id => new Types.ObjectId(id));
    await this.agentModel.findByIdAndUpdate(
      savedAgent._id,
      {
        tools_selected: toolsObjectIds,
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
      .populate('tools_selected', 'title description icon_url category is_disabled')
      .populate('client_id', 'first_name last_name email image')
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
   * Update agent with complete wizard data in one step
   */
  async updateAgentComplete(id: string, updateDto: CreateAgentWizardDto, user: { userId?: ObjectId, company_id?: ObjectId }) {
    // Step 1: Check if agent exists and user has access
    const existingAgent = await this.agentModel.findOne({ _id: id, is_deleted: false });
    if (!existingAgent) {
      throw new NotFoundException('Agent not found');
    }

    // Check if user has access to this agent
    if (user.company_id && existingAgent.company_id?.toString() !== user.company_id.toString()) {
      throw new BadRequestException('You do not have access to this agent');
    }

    // Step 2: Check title uniqueness if title is being updated
    if (updateDto.title && updateDto.title !== existingAgent.title) {
      await this.checkTitleUniqueness(updateDto.title, user.company_id?.toString());
    }

    // Step 3: Process tags if provided
    let processedTags: ObjectId[] = [];
    if (updateDto.tags && updateDto.tags.length > 0) {
      processedTags = await this.tagsService.processTagsArray(updateDto.tags, user);
    }

    // Step 4: Update basic agent information
    const agentUpdateData: any = {
      updated_by: user.userId,
    };

    if (updateDto.title) agentUpdateData.title = updateDto.title;
    if (updateDto.description) agentUpdateData.description = updateDto.description;
    if (updateDto.display_description) agentUpdateData.display_description = updateDto.display_description;
    if (updateDto.service_type) agentUpdateData.service_type = updateDto.service_type;
    if (updateDto.assistant_id) agentUpdateData.assistant_id = updateDto.assistant_id;
    if (updateDto.image) agentUpdateData.image = updateDto.image;
    if (processedTags.length > 0) agentUpdateData.tags = processedTags;

    // Update agent with basic information
    await this.agentModel.findByIdAndUpdate(id, agentUpdateData);

    // Step 5: Update tools selection (required)
    if (updateDto.tools_selected) {
      // Validate that all tools exist and are enabled
      const isValid = await this.toolsService.validateTools(updateDto.tools_selected);
      if (!isValid) {
        throw new BadRequestException('One or more selected tools are invalid or disabled');
      }

      // Update agent with tools - convert strings to ObjectIds manually
      const toolsObjectIds = updateDto.tools_selected.map(id => new Types.ObjectId(id));
      await this.agentModel.findByIdAndUpdate(
        id,
        {
          tools_selected: toolsObjectIds,
          tools_count: updateDto.tools_selected.length,
          updated_by: user.userId,
        }
      );
    }

    // Step 6: Update assignment (optional)
    if (updateDto.client_id !== undefined) {
      const assignmentUpdateData: any = {
        updated_by: user.userId,
      };

      if (updateDto.client_id) {
        assignmentUpdateData.client_id = updateDto.client_id;
        assignmentUpdateData.client_name = null; // Will be populated by populate
      } else {
        assignmentUpdateData.client_id = null;
        assignmentUpdateData.client_name = null;
      }

      // Update agent with assignment
      await this.agentModel.findByIdAndUpdate(id, assignmentUpdateData);
    }

    // Step 7: Handle invitations (optional)
    const invitations = [];
    if (updateDto.invitees && updateDto.invitees.length > 0) {
      // Get existing invitations for this agent and delete them
      const existingInvitations = await this.invitationsService.getInvitationsByAgentId(id);
      for (const invitation of existingInvitations) {
        try {
          await this.invitationsService.deleteInvitation(invitation._id.toString());
        } catch (error) {
          console.error(`Failed to delete invitation ${invitation._id}:`, error);
        }
      }

      // Create new invitations
      for (const invitee of updateDto.invitees) {
        // Skip invitation if required fields are missing
        if (!invitee.email || !invitee.role) {
          console.warn('Skipping invitation - missing required fields:', invitee);
          continue;
        }
        
        try {
          const invitation = await this.invitationsService.createOrReuseInvite({
            email: invitee.email,
            role: invitee.role,
            agent_id: id,
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

    // Step 8: Handle integration status
    let finalStatus = existingAgent.status;
    
    // Get the updated agent to check current state
    const updatedAgent = await this.agentModel.findById(id);
    
    // Determine if agent is complete (has all required fields)
    const hasTitle = updatedAgent.title && updatedAgent.title.trim() !== '';
    const hasDescription = updatedAgent.description && updatedAgent.description.trim() !== '';
    const hasTools = updatedAgent.tools_selected && updatedAgent.tools_selected.length > 0;
    const hasClient = updatedAgent.client_id;
    
    const isAgentComplete = hasTitle && hasDescription && hasTools && hasClient;
    
    // Priority 1: Explicit status provided (highest priority)
    if (updateDto.status !== undefined) {
      finalStatus = updateDto.status;
      await this.agentModel.findByIdAndUpdate(
        id,
        {
          status: updateDto.status,
          updated_by: user.userId,
        }
      );
    }
    // Priority 2: Auto-integrate logic (if explicitly provided)
    else if (updateDto.auto_integrate !== undefined) {
      if (updateDto.auto_integrate) {
        if (hasTools) {
          finalStatus = AgentStatus.ACTIVE;
          await this.agentModel.findByIdAndUpdate(
            id,
            {
              status: AgentStatus.ACTIVE,
              updated_by: user.userId,
            }
          );
        } else {
          throw new BadRequestException('Agent must have at least one tool selected to auto-integrate');
        }
      } else {
        // If auto_integrate is false, set to DRAFT
        finalStatus = AgentStatus.DRAFT;
        await this.agentModel.findByIdAndUpdate(
          id,
          {
            status: AgentStatus.DRAFT,
            updated_by: user.userId,
          }
        );
      }
    } 
    // Priority 3: Automatic status update based on completeness (lowest priority)
    else {
      if (isAgentComplete && finalStatus === AgentStatus.DRAFT) {
        finalStatus = AgentStatus.ACTIVE;
        await this.agentModel.findByIdAndUpdate(
          id,
          {
            status: AgentStatus.ACTIVE,
            updated_by: user.userId,
          }
        );
      } else if (!isAgentComplete && finalStatus === AgentStatus.ACTIVE) {
        finalStatus = AgentStatus.DRAFT;
        await this.agentModel.findByIdAndUpdate(
          id,
          {
            status: AgentStatus.DRAFT,
            updated_by: user.userId,
          }
        );
      }
    }

    // Return final agent with all populated data
    const finalAgent = await this.agentModel.findById(id)
      .populate('tools_selected', 'title description icon_url category is_disabled')
      .populate('client_id', 'first_name last_name email image')
      .populate('company_id', 'name')
      .populate('created_by', 'first_name last_name')
      .populate('updated_by', 'first_name last_name')
      .populate('tags', 'name color description');

    return {
      agent: finalAgent,
      invitations,
      status: finalStatus,
      message: updateDto.auto_integrate && finalStatus === AgentStatus.ACTIVE 
        ? 'Agent updated and integrated successfully' 
        : 'Agent updated successfully. Manual integration required to activate.'
    };
  }

  /**
   * Get detailed agent with tools and invitations
   */
  async getAgentDetails(id: string, user: { userId?: ObjectId, company_id?: ObjectId }) {
    const agent = await this.agentModel
      .findOne({ _id: id, is_deleted: false })
      .populate('tools_selected', 'title description icon_url category is_disabled')
      .populate('client_id', 'first_name last_name email image')
      .populate('company_id', 'name')
      .populate('created_by', 'first_name last_name')
      .populate('updated_by', 'first_name last_name')
      .populate('tags', 'name color description')
      .lean(); // Use lean() to get plain objects

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
      ...agent,
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
      .populate('tools_selected', 'title description icon_url category is_disabled')
      .populate('client_id', 'first_name last_name email image')
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

  /**
   * Get agent consumption and billing data
   */
  async getAgentConsumptionBilling(id: string, user: { userId?: ObjectId, company_id?: ObjectId }) {
    // First verify agent exists and user has access
    const agent = await this.agentModel
      .findOne({ _id: id, is_deleted: false })
      .select('_id company_id')
      .lean();

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // Check if user has access to this agent
    if (user.company_id && agent.company_id?.toString() !== user.company_id.toString()) {
      throw new BadRequestException('You do not have access to this agent');
    }

    // Get current month's usage data
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM format
    const startOfMonth = `${currentMonth}-01`;
    const endOfMonth = `${currentMonth}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;

    // Get daily usage for current month
    const dailyUsage = await this.getDailyUsageData(id, startOfMonth, endOfMonth);
    
    // Get pricing information
    const pricing = await this.getAgentPricing(id);
    
    // Get recent invoices
    const invoices = await this.getRecentInvoices(id);
    
    // Calculate current month totals
    const currentMonthTotals = this.calculateMonthTotals(dailyUsage, pricing);
    
    // Get KPI breakdown
    const kpiBreakdown = this.getKpiBreakdown(dailyUsage, pricing);

    return {
      agent_id: id,
      current_month: currentMonth,
      period: {
        start: startOfMonth,
        end: endOfMonth
      },
      usage_summary: {
        runtime_minutes: currentMonthTotals.runtime_minutes,
        total_cost: currentMonthTotals.total_cost,
        kpi_breakdown: kpiBreakdown
      },
      pricing: pricing,
      recent_invoices: invoices,
      daily_usage: dailyUsage
    };
  }

  /**
   * Get daily usage data for an agent
   */
  private async getDailyUsageData(agentId: string, startDate: string, endDate: string) {
    try {
      const dailyUsage = await this.dailyUsageModel.find({
        agent_id: agentId,
        date: { $gte: startDate, $lte: endDate }
      }).lean();
      return dailyUsage;
    } catch (error) {
      console.error('Error fetching daily usage data:', error);
      return [];
    }
  }

  /**
   * Get agent pricing information
   */
  private async getAgentPricing(agentId: string) {
    try {
      const pricing = await this.agentPricingModel.findOne({ agent_id: agentId })
        .sort({ version: -1 })
        .lean();
      
      if (!pricing) {
        return {
          version: 'v1',
          fixed_per_min_rate: 0.02,
          kpi_rates: []
        };
      }
      
      return pricing;
    } catch (error) {
      console.error('Error fetching agent pricing:', error);
      return {
        version: 'v1',
        fixed_per_min_rate: 0.02,
        kpi_rates: []
      };
    }
  }

  /**
   * Get recent invoices for an agent
   */
  private async getRecentInvoices(agentId: string) {
    try {
      const invoices = await this.invoiceModel.find({ agent_id: agentId })
        .sort({ created_at: -1 })
        .limit(5)
        .lean();
      return invoices;
    } catch (error) {
      console.error('Error fetching recent invoices:', error);
      return [];
    }
  }

  /**
   * Calculate month totals from daily usage data
   */
  private calculateMonthTotals(dailyUsage: any[], pricing: any) {
    let runtimeMinutes = 0;
    const kpiTotals: Record<string, number> = {};

    // Calculate totals from daily usage
    dailyUsage.forEach(day => {
      runtimeMinutes += day.totals?.runtime_minutes || 0;
      if (day.totals?.kpis) {
        Object.entries(day.totals.kpis).forEach(([key, value]) => {
          kpiTotals[key] = (kpiTotals[key] || 0) + (typeof value === 'number' ? value : 0);
        });
      }
    });

    // Calculate costs
    const runtimeCost = runtimeMinutes * (pricing.fixed_per_min_rate || 0);
    let kpiCost = 0;

    pricing.kpi_rates?.forEach((rate: any) => {
      const quantity = kpiTotals[rate.kpi_key] || 0;
      kpiCost += quantity * rate.unit_cost;
    });

    const totalCost = runtimeCost + kpiCost;

    return {
      runtime_minutes: runtimeMinutes,
      runtime_cost: runtimeCost,
      kpi_cost: kpiCost,
      total_cost: totalCost
    };
  }

  /**
   * Get KPI breakdown for display
   */
  private getKpiBreakdown(dailyUsage: any[], pricing: any) {
    const kpiTotals: Record<string, number> = {};
    const kpiCosts: Record<string, number> = {};

    // Calculate KPI totals
    dailyUsage.forEach(day => {
      if (day.totals?.kpis) {
        Object.entries(day.totals.kpis).forEach(([key, value]) => {
          kpiTotals[key] = (kpiTotals[key] || 0) + (typeof value === 'number' ? value : 0);
        });
      }
    });

    // Calculate KPI costs
    pricing.kpi_rates?.forEach((rate: any) => {
      const quantity = kpiTotals[rate.kpi_key] || 0;
      kpiCosts[rate.kpi_key] = quantity * rate.unit_cost;
    });

    // Format for display
    return Object.keys(kpiTotals).map(key => ({
      key,
      quantity: kpiTotals[key],
      unit_cost: pricing.kpi_rates?.find((r: any) => r.kpi_key === key)?.unit_cost || 0,
      total_cost: kpiCosts[key] || 0,
      unit: pricing.kpi_rates?.find((r: any) => r.kpi_key === key)?.unit || 'unit'
    }));
  }
} 