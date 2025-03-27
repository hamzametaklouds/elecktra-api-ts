import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, UsePipes, ValidationPipe, UseFilters } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentRequestsService } from './agent-requests.service';
import { CreateAgentRequestDto } from './dtos/create-agent-request.dto';
import { UpdateAgentRequestDto } from './dtos/update-agent-request.dto';
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

@ApiTags('agent-requests')
@Controller('agent-requests')
@UseFilters(HttpExceptionFilter)
export class AgentRequestsController {
  constructor(private readonly agentRequestsService: AgentRequestsService) {}

  @Post()
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(  Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Create a new agent request' })
  @ApiResponse({ status: 201, description: 'Agent request successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: CreateAgentRequestDto })
  create(@Body() createAgentRequestDto: CreateAgentRequestDto, @Req() req: Request) {
    return this.agentRequestsService.create(createAgentRequestDto, req.user);
  }

  @Get()
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN,Role.SUPPORT_ADMIN, Role.BUSINESS_OWNER, Role.USER)
  @ApiOperation({ summary: 'Get all agent requests with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved agent requests' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ type: QueryParamsDTO })
  async findAll(@ParamsHandler() pagination: IPaginationQuery, @Req() req: Request) {
    const { $rpp, $page, $filter, $orderBy } = pagination;
    
    if ($rpp && $page) {
      const result = await this.agentRequestsService.getPaginatedRequests($rpp, $page, $filter, $orderBy, req.user);
      return {
        status: result ? true : false,
        statusCode: result ? 200 : 400,
        message: result ? 'Agent requests fetched successfully' : 'Something went wrong with parameters',
        data: result ? result : null
      };
    }

    const result = await this.agentRequestsService.getFilteredRequests($filter, $orderBy, req.user);
    return {
      status: result ? true : false,
      statusCode: result ? 200 : 400,
      message: result ? 'Agent requests fetched successfully' : 'Something went wrong with parameters',
      data: result ? result : null
    };
  }

  @Get(':id')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN,Role.SUPPORT_ADMIN, Role.BUSINESS_OWNER, Role.USER)
  @ApiOperation({ summary: 'Get a specific agent request by ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved agent request' })
  @ApiResponse({ status: 404, description: 'Agent request not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.agentRequestsService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN,Role.SUPPORT_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Update an agent request' })
  @ApiResponse({ status: 200, description: 'Agent request successfully updated' })
  @ApiResponse({ status: 404, description: 'Agent request not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: UpdateAgentRequestDto })
  update(
    @Param('id') id: string,
    @Body() updateAgentRequestDto: UpdateAgentRequestDto,
    @Req() req: Request,
  ) {
    return this.agentRequestsService.update(id, updateAgentRequestDto, req.user);
  }

  @Delete(':id')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN,Role.SUPPORT_ADMIN, Role.BUSINESS_OWNER, Role.USER)
  @ApiOperation({ summary: 'Soft delete an agent request' })
  @ApiResponse({ status: 200, description: 'Agent request successfully deleted' })
  @ApiResponse({ status: 404, description: 'Agent request not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.agentRequestsService.remove(id, req.user);
  }
} 