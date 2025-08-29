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

@ApiTags('Notification Settings')
@ApiBearerAuth()
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
  ): Promise<NotificationSettingsResponseDto> {
    const userId = req.user._id;
    const result = await this.notificationSettingsService.create(createNotificationSettingsDto, userId);
    return NotificationSettingsTransformer.toResponseDto(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notification settings (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all notification settings',
    type: [NotificationSettingsResponseDto],
  })
  async findAll(): Promise<NotificationSettingsResponseDto[]> {
    const result = await this.notificationSettingsService.findAll();
    return NotificationSettingsTransformer.toResponseDtoArray(result);
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
  async getMySettings(@Request() req): Promise<NotificationSettingsResponseDto> {
    const userId = req.user._id;
    const result = await this.notificationSettingsService.getUserNotificationSettings(userId);
    return NotificationSettingsTransformer.toResponseDto(result);
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
  async findOne(@Param('id') id: string): Promise<NotificationSettingsResponseDto> {
    const result = await this.notificationSettingsService.findOne(id);
    return NotificationSettingsTransformer.toResponseDto(result);
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
  ): Promise<NotificationSettingsResponseDto> {
    const userId = req.user._id;
    const result = await this.notificationSettingsService.update(id, updateNotificationSettingsDto, userId);
    return NotificationSettingsTransformer.toResponseDto(result);
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
  ): Promise<NotificationSettingsResponseDto> {
    const userId = req.user._id;
    const result = await this.notificationSettingsService.updateByUserId(userId, updateNotificationSettingsDto);
    return NotificationSettingsTransformer.toResponseDto(result);
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
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    const userId = req.user._id;
    return this.notificationSettingsService.remove(id, userId);
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
  async removeMySettings(@Request() req): Promise<void> {
    const userId = req.user._id;
    return this.notificationSettingsService.removeByUserId(userId);
  }
} 