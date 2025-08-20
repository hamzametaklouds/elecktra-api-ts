import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, UsePipes, ValidationPipe, Query, UseFilters } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ToolsService } from './tools.service';
import { CreateToolDto } from './dtos/create-tool.dto';
import { UpdateToolDto } from './dtos/update-tool.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { RolesGuard } from 'src/app/guards/role-guard';
import { Roles } from 'src/app/dtos/roles-decorator';
import { Role } from 'src/roles/roles.schema';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { HttpExceptionFilter } from 'src/app/filters/http-exception.filter';
import { QueryParamsDTO } from 'src/app/dtos/query-params.dto';
import { ParamsHandler } from 'src/app/custom-decorators/params-handler.decorator';
import { IPaginationQuery } from 'src/app/interfaces';

@ApiTags('tools')
@Controller('tools')
@UseFilters(HttpExceptionFilter)
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Post()
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SUPPORT_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Create a new tool' })
  @ApiResponse({ status: 201, description: 'Tool successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: CreateToolDto })
  async create(@Body() createToolDto: CreateToolDto) {
    const result = await this.toolsService.create(createToolDto);
    return {
      status: true,
      statusCode: 201,
      message: 'Tool created successfully',
      data: result
    };
  }

  @Get()
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER, Role.SUPPORT_ADMIN)
  @ApiOperation({ summary: 'Get all tools with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved tools' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ type: QueryParamsDTO })
  async findAll(@ParamsHandler() pagination: IPaginationQuery) {
    const { $rpp, $page, $filter, $orderBy } = pagination;
    
    if ($rpp && $page) {
      const result = await this.toolsService.getPaginatedTools($rpp, $page, $filter, $orderBy);
      return {
        status: result ? true : false,
        statusCode: result ? 200 : 400,
        message: result ? 'Tools fetched successfully' : 'Something went wrong with parameters',
        data: result ? result : null
      };
    }

    const result = await this.toolsService.getFilteredTools($filter, $orderBy);
    return {
      status: result ? true : false,
      statusCode: result ? 200 : 400,
      message: result ? 'Tools fetched successfully' : 'Something went wrong with parameters',
      data: result ? result : null
    };
  }

  @Get(':id')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER, Role.SUPPORT_ADMIN)
  @ApiOperation({ summary: 'Get a specific tool by ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved tool' })
  @ApiResponse({ status: 404, description: 'Tool not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    const result = await this.toolsService.findOne(id);
    return {
      status: true,
      statusCode: 200,
      message: 'Tool fetched successfully',
      data: result
    };
  }

  @Put(':id')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SUPPORT_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Update a tool' })
  @ApiResponse({ status: 200, description: 'Tool successfully updated' })
  @ApiResponse({ status: 404, description: 'Tool not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: UpdateToolDto })
  async update(
    @Param('id') id: string,
    @Body() updateToolDto: UpdateToolDto,
  ) {
    const result = await this.toolsService.update(id, updateToolDto);
    return {
      status: true,
      statusCode: 200,
      message: 'Tool updated successfully',
      data: result
    };
  }

  @Delete(':id')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SUPPORT_ADMIN)
  @ApiOperation({ summary: 'Soft delete a tool' })
  @ApiResponse({ status: 200, description: 'Tool successfully deleted' })
  @ApiResponse({ status: 404, description: 'Tool not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string) {
    const result = await this.toolsService.remove(id);
    return {
      status: true,
      statusCode: 200,
      message: 'Tool deleted successfully',
      data: result
    };
  }

  @Post('seed')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SUPPORT_ADMIN)
  @ApiOperation({ summary: 'Seed base tools' })
  @ApiResponse({ status: 200, description: 'Base tools seeded successfully' })
  async seedBaseTools() {
    await this.toolsService.seedBaseTools();
    return {
      status: true,
      statusCode: 200,
      message: 'Base tools seeded successfully'
    };
  }
}