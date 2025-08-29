import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationSettingsService } from './notification-settings.service';
import { CreateNotificationSettingsDto } from './dtos/create-notification-settings.dto';
import { UpdateNotificationSettingsDto } from './dtos/update-notification-settings.dto';
import { NotificationSettingsResponseDto } from './dtos/notification-settings-response.dto';
import { JWTAuthGuard } from '../auth/guards/jwt-auth-guard';
import { NotificationSettingsTransformer } from './notification-settings.transformer';
import { AuthorizationHeader } from '../app/swagger.constant';

@ApiTags('Notification Settings')
@ApiBearerAuth(AuthorizationHeader)
@UseGuards(JWTAuthGuard)
@Controller('notification-settings')
export class NotificationSettingsController {
  constructor(
    private readonly notificationSettingsService: NotificationSettingsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create notification settings for the authenticated user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Notification settings created successfully',
    type: NotificationSettingsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - Invalid data provided',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflict - Notification settings already exist for this user',
  })
  async create(
    @Body() createNotificationSettingsDto: CreateNotificationSettingsDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    const result = await this.notificationSettingsService.create(createNotificationSettingsDto, userId);
    return {
      status: true,
      statusCode: 201,
      message: 'Notification settings created successfully',
      data: NotificationSettingsTransformer.toResponseDto(result)
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all notification settings (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all notification settings',
    type: [NotificationSettingsResponseDto],
  })
  async findAll() {
    const result = await this.notificationSettingsService.findAll();
    return {
      status: true,
      statusCode: 200,
      message: 'Notification settings retrieved successfully',
      data: NotificationSettingsTransformer.toResponseDtoArray(result)
    };
  }

  @Get('my-settings')
  @ApiOperation({ summary: 'Get current user notification settings' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User notification settings retrieved successfully',
    type: NotificationSettingsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification settings not found',
  })
  async getMySettings(@Request() req) {
    const userId = req.user.userId;
    const result = await this.notificationSettingsService.getUserNotificationSettings(userId);
    return {
      status: true,
      statusCode: 200,
      message: 'User notification settings retrieved successfully',
      data: NotificationSettingsTransformer.toResponseDto(result)
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification settings by ID' })
  @ApiParam({ name: 'id', description: 'Notification settings ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification settings retrieved successfully',
    type: NotificationSettingsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification settings not found',
  })
  async findOne(@Param('id') id: string) {
    const result = await this.notificationSettingsService.findOne(id);
    return {
      status: true,
      statusCode: 200,
      message: 'Notification settings retrieved successfully',
      data: NotificationSettingsTransformer.toResponseDto(result)
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update notification settings by ID' })
  @ApiParam({ name: 'id', description: 'Notification settings ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification settings updated successfully',
    type: NotificationSettingsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification settings not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - Invalid data provided',
  })
  async update(
    @Param('id') id: string,
    @Body() updateNotificationSettingsDto: UpdateNotificationSettingsDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    const result = await this.notificationSettingsService.update(id, updateNotificationSettingsDto, userId);
    return {
      status: true,
      statusCode: 200,
      message: 'Notification settings updated successfully',
      data: NotificationSettingsTransformer.toResponseDto(result)
    };
  }

  @Put('my-settings')
  @ApiOperation({ summary: 'Update current user notification settings' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User notification settings updated successfully',
    type: NotificationSettingsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification settings not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - Invalid data provided',
  })
  async updateMySettings(
    @Body() updateNotificationSettingsDto: UpdateNotificationSettingsDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    const result = await this.notificationSettingsService.updateByUserId(userId, updateNotificationSettingsDto);
    return {
      status: true,
      statusCode: 200,
      message: 'User notification settings updated successfully',
      data: NotificationSettingsTransformer.toResponseDto(result)
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification settings by ID' })
  @ApiParam({ name: 'id', description: 'Notification settings ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification settings deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification settings not found',
  })
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    await this.notificationSettingsService.remove(id, userId);
    return {
      status: true,
      statusCode: 200,
      message: 'Notification settings deleted successfully',
      data: null
    };
  }

  @Delete('my-settings')
  @ApiOperation({ summary: 'Delete current user notification settings' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User notification settings deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification settings not found',
  })
  async removeMySettings(@Request() req) {
    const userId = req.user.userId;
    await this.notificationSettingsService.removeByUserId(userId);
    return {
      status: true,
      statusCode: 200,
      message: 'User notification settings deleted successfully',
      data: null
    };
  }
} 