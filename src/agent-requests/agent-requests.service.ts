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
import { isValidObjectId, matchFilters } from 'src/app/mongo.utils';

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
    if(user?.company_id) {  
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
    const workflowsInstallationTotal = selectedWorkflows.reduce((sum, workflow) => sum + workflow.installation_price, 0);
    const baseInstallationPrice = agent.pricing.installation_price || 0;
    const totalInstallationPrice = baseInstallationPrice + workflowsInstallationTotal;
    const subscriptionPrice = agent.pricing.subscription_price || 0;
    const grandTotal = workflowsTotal + totalInstallationPrice + subscriptionPrice;
    
    // Calculate request time frame
    const requestTimeFrame = selectedWorkflows.reduce((sum, workflow) => sum + workflow.weeks, 0);

    // Create agent request with cloned data
    const agentRequest = new this.agentRequestModel({
      agent_id: agent._id,
      title: agent.title,
      description: agent.description,
      display_description: agent.display_description,
      image: agent.image,
      service_type: agent?.service_type,
      agent_assistant_id: agent.assistant_id,
      company_id: company?._id || null,
      company_owner_id: company?.created_by || null,
      status: AgentRequestStatus.SUBMITTED,
      request_time_frame: requestTimeFrame,
      pricing: {
        installation_price: totalInstallationPrice,
        subscription_price: subscriptionPrice
      },
      work_flows: selectedWorkflows,
      invoice: {
        workflows_total: workflowsTotal,
        workflows_installation_total: workflowsInstallationTotal,
        installation_price: totalInstallationPrice,
        subscription_price: subscriptionPrice,
        grand_total: grandTotal,
        request_time_frame: requestTimeFrame
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


    const newFilter = matchFilters(filter);

    console.log('newFilter', newFilter);

    const skip: number = (page - 1) * rpp;
    const totalDocuments: number = await this.agentRequestModel.countDocuments(newFilter);
    const totalPages: number = Math.ceil(totalDocuments / rpp);
    page = page > totalPages ? totalPages : page;


    const requests = await this.agentRequestModel.aggregate([
      { $match: newFilter },
      {
        $lookup: {
          from: 'agents',
          localField: 'agent_id',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'integrations',
                localField: 'work_flows.integrations',
                foreignField: '_id',
                as: 'allIntegrations'
              }
            },
            {
              $addFields: {
                work_flows: {
                  $map: {
                    input: '$work_flows',
                    as: 'workflow',
                    in: {
                      $mergeObjects: [
                        '$$workflow',
                        {
                          integrations: {
                            $filter: {
                              input: '$allIntegrations',
                              as: 'integration',
                              cond: {
                                $in: ['$$integration._id', '$$workflow.integrations']
                              }
                            }
                          }
                        }
                      ]
                    }
                  }
                }
              }
            },
            {
              $project: {
                allIntegrations: 0
              }
            }
          ],
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
      { $sort: orderBy },
      { $skip: skip },
      { $limit: rpp }
    ]);

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

    const newFilter = matchFilters(filter);

    console.log('newFilter', ...newFilter);

    return await this.agentRequestModel.aggregate([
      { $match: newFilter },
      {
        $lookup: {
          from: 'agents',
          localField: 'agent_id',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'integrations',
                localField: 'work_flows.integrations',
                foreignField: '_id',
                as: 'allIntegrations'
              }
            },
            {
              $addFields: {
                work_flows: {
                  $map: {
                    input: '$work_flows',
                    as: 'workflow',
                    in: {
                      $mergeObjects: [
                        '$$workflow',
                        {
                          integrations: {
                            $filter: {
                              input: '$allIntegrations',
                              as: 'integration',
                              cond: {
                                $in: ['$$integration._id', '$$workflow.integrations']
                              }
                            }
                          }
                        }
                      ]
                    }
                  }
                }
              }
            },
            {
              $project: {
                allIntegrations: 0
              }
            }
          ],
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
      { $sort: orderBy }
    ]);
  }

  async findOne(id) {

    const requestId = await this.agentRequestModel.findOne({_id:id,is_deleted:false});
    if(!requestId){
      throw new NotFoundException('Agent request not found');
    }
    const [request] = await this.agentRequestModel.aggregate([
      { 
        $match: { 
          _id: requestId._id, 
          is_deleted: false 
        } 
      },
      {
        $lookup: {
          from: 'agents',
          localField: 'agent_id',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'integrations',
                localField: 'work_flows.integrations',
                foreignField: '_id',
                as: 'allIntegrations'
              }
            },
            {
              $addFields: {
                work_flows: {
                  $map: {
                    input: '$work_flows',
                    as: 'workflow',
                    in: {
                      $mergeObjects: [
                        '$$workflow',
                        {
                          integrations: {
                            $filter: {
                              input: '$allIntegrations',
                              as: 'integration',
                              cond: {
                                $in: ['$$integration._id', '$$workflow.integrations']
                              }
                            }
                          }
                        }
                      ]
                    }
                  }
                }
              }
            },
            {
              $project: {
                allIntegrations: 0
              }
            }
          ],
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
          from: 'companies',
          localField: 'company_id',
          foreignField: '_id',
          as: 'company_id'
        }
      },
      { $unwind: { path: '$company_id', preserveNullAndEmptyArrays: true } }
    ]);

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
      updateAgentRequestDto['agent_assistant_id'] = request?.agent_assistant_id;

      console.log('updatedRequest', updatedRequest);
     
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