import { Controller, Get, Post, Body, Param, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { JWTAuthGuard } from '../auth/guards/jwt-auth-guard';
import { RolesGuard } from '../app/guards/role-guard';
import { Role } from '../roles/roles.schema';
import { AuthorizationHeader } from '../app/swagger.constant';

@ApiTags('Tags')
@Controller('tags')
@UseGuards(JWTAuthGuard, RolesGuard)
@ApiBearerAuth(AuthorizationHeader)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ status: 200, description: 'Tags retrieved successfully' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit results', type: Number })
  async getAllTags(
    @Query('q') query?: string,
    @Query('limit') limit?: number
  ) {
    if (query) {
      return await this.tagsService.searchTags(query, limit || 10);
    }
    return await this.tagsService.getAllTags();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search tags' })
  @ApiResponse({ status: 200, description: 'Tags search completed' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit results', type: Number })
  async searchTags(
    @Query('q') query: string,
    @Query('limit') limit?: number
  ) {
    return await this.tagsService.searchTags(query, limit || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiResponse({ status: 200, description: 'Tag retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async getTagById(@Param('id') id: string) {
    const tag = await this.tagsService.findById(id);
    if (!tag) {
      return { status: false, message: 'Tag not found' };
    }
    return tag;
  }
} 