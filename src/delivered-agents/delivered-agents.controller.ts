import { Controller, Get, Post, Body, Param, UseGuards, Req, UsePipes, ValidationPipe, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { DeliveredAgentsService } from './delivered-agents.service';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { RolesGuard } from 'src/app/guards/role-guard';
import { Roles } from 'src/app/dtos/roles-decorator';
import { Role } from 'src/roles/roles.schema';
import { Request } from 'express';
import { MaintenanceStatus } from './delivered-agents.schema';
import { ParamsHandler } from 'src/app/custom-decorators/params-handler.decorator';
import { IPaginationQuery } from 'src/app/interfaces';
import { QueryParamsDTO } from 'src/app/dtos/query-params.dto';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { UpdateClientAgentDto } from './dtos/update-status.dto';

@ApiTags('delivered-agents')
@Controller('delivered-agents')
@UseGuards(JWTAuthGuard, RolesGuard)
export class DeliveredAgentsController {
  constructor(private readonly deliveredAgentsService: DeliveredAgentsService) {}

  @Get('list')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER,Role.SUPPORT_ADMIN)
  @ApiQuery({ type: QueryParamsDTO })
  async getDeliveredAgentsList(@ParamsHandler() pagination: IPaginationQuery, @Req() req: Request) {
    const { $rpp, $page, $filter, $orderBy } = pagination;
    if ($rpp && $page) {
      const result = await this.deliveredAgentsService.getPaginatedDeliveredAgents($rpp, $page, $filter, $orderBy, req.user);
      return {
        status: result ? true : false,
        statusCode: result ? 200 : 400,
        message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
        data: result ? result : null
      }
    }
    const result = await this.deliveredAgentsService.getFilteredDeliveredAgents($filter, $orderBy, req.user);
    return {
      status: result ? true : false,
      statusCode: result ? 200 : 400,
      message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
      data: result ? result : null
    }
  }

  @Get(':id')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER,Role.SUPPORT_ADMIN)
  async getDeliveredAgent(@Param('id') id: string, @Req() req: Request) {
    const deliveredAgent = await this.deliveredAgentsService.findOne(id, req.user);
    return {
      status: true,
      statusCode: 200,
      message: 'Delivered agent retrieved successfully',
      data: deliveredAgent
    };
  }

  @Put(':id/maintenance-status')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER,Role.SUPPORT_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiBody({ type: UpdateClientAgentDto })
  async updateMaintenanceStatus(
    @Param('id') id: string,
    @Body() body:UpdateClientAgentDto,
    @Req() req: Request
  ) {
    const deliveredAgent = await this.deliveredAgentsService.updateMaintenanceStatus(
      id,
      body.status,
      req.user
    );
    return {
      status: true,
      statusCode: 200,
      message: 'Maintenance status updated successfully',
      data: deliveredAgent
    };
  }

  @Put(':id/cancel-subscription')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER, Role.SUPPORT_ADMIN)
  async cancelSubscription(
    @Param('id') id: string,
    @Req() req: Request
  ) {
    const deliveredAgent = await this.deliveredAgentsService.updateMaintenanceStatus(
      id,
      MaintenanceStatus.SUBSCRIPTION_CANCELLED,
      req.user
    );
    return {
      status: true,
      statusCode: 200,
      message: 'Subscription cancelled successfully',
      data: deliveredAgent
    };
  }
} 