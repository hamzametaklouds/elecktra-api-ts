import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, UsePipes, ValidationPipe, Query, UseFilters } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dtos/create-agent.dto';
import { UpdateAgentDto } from './dtos/update-agent.dto';

import { CreateAgentWizardDto } from './dtos/create-agent-wizard.dto';
import { UpdateAgentToolsDto } from './dtos/update-agent-tools.dto';
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




  @Post('create-complete')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.SUPPORT_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Create agent with complete wizard data in one step' })
  @ApiResponse({ status: 201, description: 'Agent created successfully with all wizard steps' })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed or tools invalid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: CreateAgentWizardDto })
  async createAgentComplete(
    @Body() createDto: CreateAgentWizardDto,
    @Req() req: Request,
  ) {
    const result = await this.agentsService.createAgentComplete(createDto, req.user);
    return {
      status: true,
      statusCode: 201,
      message: result.message,
      data: {
        agent: result.agent,
        invitations: result.invitations,
        status: result.status
      }
    };
  }

  @Put(':id/update-complete')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.SUPPORT_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Update agent with complete wizard data in one step (includes status control)' })
  @ApiResponse({ status: 200, description: 'Agent updated successfully with all wizard steps' })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed or tools invalid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  @ApiBody({ type: CreateAgentWizardDto })
  async updateAgentComplete(
    @Param('id') id: string,
    @Body() updateDto: CreateAgentWizardDto,
    @Req() req: Request,
  ) {
    const result = await this.agentsService.updateAgentComplete(id, updateDto, req.user);
    return {
      status: true,
      statusCode: 200,
      message: result.message,
      data: {
        agent: result.agent,
        invitations: result.invitations,
        status: result.status
      }
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
    
    // Ensure user object includes roles for role-based filtering
    const userWithRoles = {
      ...req.user,
      roles: (req.user as any)?.roles || []
    };
    
    if ($rpp && $page) {
      const result = await this.agentsService.getPaginatedAgents($rpp, $page, $filter, $orderBy, userWithRoles);
      return {
        status: result ? true : false,
        statusCode: result ? 200 : 400,
        message: result ? 'Agents fetched successfully' : 'Something went wrong with parameters',
        data: result ? result : null
      };
    }

    const result = await this.agentsService.getFilteredAgents($filter, $orderBy, userWithRoles);
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

  @Get(':id/consumption-billing')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER, Role.SUPPORT_ADMIN)
  @ApiOperation({ summary: 'Get agent consumption and billing data' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved agent consumption and billing data' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAgentConsumptionBilling(@Param('id') id: string, @Req() req: Request) {
    const result = await this.agentsService.getAgentConsumptionBilling(id, req.user);
    return {
      status: true,
      statusCode: 200,
      message: 'Agent consumption and billing data retrieved successfully',
      data: result
    };
  }

  @Put(':id/tools')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.SUPPORT_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Update agent tools selection' })
  @ApiResponse({ status: 200, description: 'Agent tools updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed or tools invalid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
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


} 