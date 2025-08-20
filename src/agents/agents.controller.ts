import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, UsePipes, ValidationPipe, Query, UseFilters } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dtos/create-agent.dto';
import { UpdateAgentDto } from './dtos/update-agent.dto';
import { UpdateAgentBasicDto } from './dtos/update-agent-basic.dto';
import { UpdateAgentToolsDto } from './dtos/update-agent-tools.dto';
import { UpdateAgentAssignmentDto } from './dtos/update-agent-assignment.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { RolesGuard } from 'src/app/guards/role-guard';
import { Roles } from 'src/app/dtos/roles-decorator';
import { Role } from 'src/roles/roles.schema';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { Request } from 'express';
import { HttpExceptionFilter } from 'src/app/filters/http-exception.filter';
import { QueryParamsDTO } from 'src/app/dtos/query-params.dto';
import { ParamsHandler } from 'src/app/custom-decorators/params-handler.decorator';
import { IPaginationQuery } from 'src/app/interfaces';

@ApiTags('agents')
@Controller('agents')
@UseFilters(HttpExceptionFilter)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN,Role.SUPPORT_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Create a new agent' })
  @ApiResponse({ status: 201, description: 'Agent successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: CreateAgentDto })
  create(@Body() createAgentDto: CreateAgentDto, @Req() req: Request) {
    return this.agentsService.create(createAgentDto, req.user);
  }


  @Post('create-wizard')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.SUPPORT_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Step 1: Create agent with basic information (wizard start)' })
  @ApiResponse({ status: 201, description: 'Agent created successfully with wizard data' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: UpdateAgentBasicDto })
  async createAgentWizard(
    @Body() createDto: UpdateAgentBasicDto,
    @Req() req: Request,
  ) {
    // Create agent with the basic info provided
    const agentData: CreateAgentDto = {
      title: createDto.title || 'New Agent',
      description: createDto.description || 'Agent created via wizard',
      display_description: createDto.display_description || 'Agent created via wizard',
      service_type: createDto.service_type || 'general',
      assistant_id: createDto.assistant_id,
      image: createDto.image,
      pricing: { installation_price: 0, subscription_price: 0 },
      work_flows: []
    };

    const result = await this.agentsService.create(agentData, req.user);
    return {
      status: true,
      statusCode: 201,
      message: 'Agent created successfully. Proceed to select tools.',
      data: result
    };
  }

  @Put(':id/basic')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.SUPPORT_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Update agent basic information (optional edit)' })
  @ApiResponse({ status: 200, description: 'Agent basic info updated successfully' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: UpdateAgentBasicDto })
  async updateAgentBasic(
    @Param('id') id: string,
    @Body() updateDto: UpdateAgentBasicDto,
    @Req() req: Request,
  ) {
    const result = await this.agentsService.updateAgentBasic(id, updateDto, req.user);
    return {
      status: true,
      statusCode: 200,
      message: 'Agent basic information updated successfully',
      data: result
    };
  }

  @Put(':id/tools')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.SUPPORT_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Step 2: Select tools for the agent (required)' })
  @ApiResponse({ status: 200, description: 'Agent tools updated successfully' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: UpdateAgentToolsDto })
  async updateAgentTools(
    @Param('id') id: string,
    @Body() updateDto: UpdateAgentToolsDto,
    @Req() req: Request,
  ) {
    const result = await this.agentsService.updateAgentTools(id, updateDto, req.user);
    return {
      status: true,
      statusCode: 200,
      message: 'Agent tools updated successfully',
      data: result
    };
  }

  @Put(':id/assignment')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.SUPPORT_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Step 3: Assign client and send invitations (optional)' })
  @ApiResponse({ status: 200, description: 'Agent assignment updated and invitations sent' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: UpdateAgentAssignmentDto })
  async updateAgentAssignment(
    @Param('id') id: string,
    @Body() updateDto: UpdateAgentAssignmentDto,
    @Req() req: Request,
  ) {
    const result = await this.agentsService.updateAgentAssignment(id, updateDto, req.user);
    return {
      status: true,
      statusCode: 200,
      message: 'Agent assignment updated and invitations sent successfully',
      data: result
    };
  }

  @Post(':id/integrate')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.SUPPORT_ADMIN)
  @ApiOperation({ summary: 'Step 4: Integrate agent - finalize and activate (required)' })
  @ApiResponse({ status: 200, description: 'Agent integrated successfully' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  @ApiResponse({ status: 400, description: 'Agent validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async integrateAgent(@Param('id') id: string, @Req() req: Request) {
    const result = await this.agentsService.integrateAgent(id, req.user);
    return {
      status: true,
      statusCode: 200,
      message: 'Agent integrated successfully',
      data: result
    };
  }

  @Get('search')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER, Role.SUPPORT_ADMIN)
  @ApiOperation({ summary: 'Search agents with simple filters' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchAgents(
    @Req() req: Request,
    @Query('q') q?: string,              // Text search: "email assistant"
    @Query('status') status?: string,    // Single status: "Active" or "Draft"
    @Query('page') page: number = 1,     // Page number (simple!)
    @Query('limit') limit: number = 20   // Results per page
  ) {
    const result = await this.agentsService.getPaginatedAgents(
      limit,
      page,
      { 
        ...(q && { $text: { $search: q } }),
        ...(status && { status }),
      },
      { created_at: -1 }, // Most recent first
      req.user
    );

    return {
      status: true,
      statusCode: 200,
      message: 'Agents retrieved successfully',
      data: result
    };
  }

  @Get()
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER,Role.SUPPORT_ADMIN)
  @ApiOperation({ summary: 'Get all agents with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved agents' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ type: QueryParamsDTO })
  async findAll(@ParamsHandler() pagination: IPaginationQuery, @Req() req: Request) {
    const { $rpp, $page, $filter, $orderBy } = pagination;
    
    if ($rpp && $page) {
      const result = await this.agentsService.getPaginatedAgents($rpp, $page, $filter, $orderBy, req.user);
      return {
        status: result ? true : false,
        statusCode: result ? 200 : 400,
        message: result ? 'Agents fetched successfully' : 'Something went wrong with parameters',
        data: result ? result : null
      };
    }

    const result = await this.agentsService.getFilteredAgents($filter, $orderBy, req.user);
    return {
      status: result ? true : false,
      statusCode: result ? 200 : 400,
      message: result ? 'Agents fetched successfully' : 'Something went wrong with parameters',
      data: result ? result : null
    };
  }

  @Get(':id')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER,Role.SUPPORT_ADMIN)
  @ApiOperation({ summary: 'Get a specific agent by ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved agent' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.agentsService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER,Role.SUPPORT_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Update an agent' })
  @ApiResponse({ status: 200, description: 'Agent successfully updated' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: UpdateAgentDto })
  update(
    @Param('id') id: string,
    @Body() updateAgentDto: UpdateAgentDto,
    @Req() req: Request,
  ) {
    return this.agentsService.update(id, updateAgentDto, req.user);
  }

  @Delete(':id')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.SUPPORT_ADMIN)
  @ApiOperation({ summary: 'Soft delete an agent' })
  @ApiResponse({ status: 200, description: 'Agent successfully deleted' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.agentsService.remove(id, req.user);
  }

  // Wizard Endpoints

  @Get(':id/details')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER, Role.SUPPORT_ADMIN)
  @ApiOperation({ summary: 'Get detailed agent with tools and invitations' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved agent details' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAgentDetails(@Param('id') id: string, @Req() req: Request) {
    const result = await this.agentsService.getAgentDetails(id, req.user);
    return {
      status: true,
      statusCode: 200,
      message: 'Agent details retrieved successfully',
      data: result
    };
  }


} 