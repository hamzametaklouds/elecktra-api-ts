import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, UsePipes, ValidationPipe, UseFilters } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto } from './dtos/create-integration.dto';
import { UpdateIntegrationDto } from './dtos/update-integration.dto';
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

@ApiTags('integrations')
@Controller('integrations')
@UseFilters(HttpExceptionFilter)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post()
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Create a new integration' })
  @ApiResponse({ status: 201, description: 'Integration successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: CreateIntegrationDto })
  create(@Body() createIntegrationDto: CreateIntegrationDto, @Req() req: Request) {
    return this.integrationsService.create(createIntegrationDto, req.user);
  }

  @Get()
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER)
  @ApiOperation({ summary: 'Get all integrations with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved integrations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ type: QueryParamsDTO })
  async findAll(@ParamsHandler() pagination: IPaginationQuery, @Req() req: Request) {
    const { $rpp, $page, $filter, $orderBy } = pagination;
    
    if ($rpp && $page) {
      const result = await this.integrationsService.getPaginatedIntegrations($rpp, $page, $filter, $orderBy, req.user);
      return {
        status: result ? true : false,
        statusCode: result ? 200 : 400,
        message: result ? 'Integrations fetched successfully' : 'Something went wrong with parameters',
        data: result ? result : null
      };
    }

    const result = await this.integrationsService.getFilteredIntegrations($filter, $orderBy, req.user);
    return {
      status: result ? true : false,
      statusCode: result ? 200 : 400,
      message: result ? 'Integrations fetched successfully' : 'Something went wrong with parameters',
      data: result ? result : null
    };
  }

  @Get(':id')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER)
  @ApiOperation({ summary: 'Get a specific integration by ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved integration' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.integrationsService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Update an integration' })
  @ApiResponse({ status: 200, description: 'Integration successfully updated' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: UpdateIntegrationDto })
  update(
    @Param('id') id: string,
    @Body() updateIntegrationDto: UpdateIntegrationDto,
    @Req() req: Request,
  ) {
    return this.integrationsService.update(id, updateIntegrationDto, req.user);
  }

  @Delete(':id')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN)
  @ApiOperation({ summary: 'Soft delete an integration' })
  @ApiResponse({ status: 200, description: 'Integration successfully deleted' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.integrationsService.remove(id, req.user);
  }
} 