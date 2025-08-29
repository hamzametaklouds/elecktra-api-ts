import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateNotificationSettingsDto } from './dtos/create-notification-settings.dto';
import { UpdateNotificationSettingsDto } from './dtos/update-notification-settings.dto';
import { INotificationSettings } from './notification-settings.schema';
import { NOTIFICATION_SETTINGS_DEFAULT_VALUES, NOTIFICATION_SETTINGS_PROVIDER_TOKEN } from './notification-settings.constants';

@Injectable()
export class NotificationSettingsService {
  constructor(
    @Inject(NOTIFICATION_SETTINGS_PROVIDER_TOKEN)
    private notificationSettingsModel: Model<INotificationSettings>,
  ) {}

  async create(
    createNotificationSettingsDto: CreateNotificationSettingsDto,
    userId: string,
  ): Promise<INotificationSettings> {
    const existingSettings = await this.findByUserId(userId);
    
    if (existingSettings) {
      throw new Error('Notification settings already exist for this user');
    }

    const createdSettings = new this.notificationSettingsModel({
      ...createNotificationSettingsDto,
      user_id: userId,
      created_by: userId,
    });

    return createdSettings.save();
  }

  async findAll(): Promise<INotificationSettings[]> {
    return this.notificationSettingsModel
      .find({ is_deleted: false })
      .exec();
  }

  async findOne(id: string): Promise<INotificationSettings> {
    const settings = await this.notificationSettingsModel
      .findOne({ _id: id, is_deleted: false })
      .exec();

    if (!settings) {
      throw new NotFoundException('Notification settings not found');
    }

    return settings;
  }

  async findByUserId(userId: string): Promise<INotificationSettings | null> {
    return this.notificationSettingsModel
      .findOne({ user_id: userId, is_deleted: false })
      .exec();
  }

  async getUserNotificationSettings(userId: string): Promise<INotificationSettings> {
    const settings = await this.findByUserId(userId);
    
    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = new this.notificationSettingsModel({
        user_id: userId,
        ...NOTIFICATION_SETTINGS_DEFAULT_VALUES,
        created_by: userId,
      });
      
      return defaultSettings.save();
    }

    return settings;
  }

  async update(
    id: string,
    updateNotificationSettingsDto: UpdateNotificationSettingsDto,
    userId: string,
  ): Promise<INotificationSettings> {
    const updatedSettings = await this.notificationSettingsModel
      .findOneAndUpdate(
        { _id: id, is_deleted: false },
        {
          ...updateNotificationSettingsDto,
          updated_by: userId,
        },
        { new: true },
      )
      .exec();

    if (!updatedSettings) {
      throw new NotFoundException('Notification settings not found');
    }

    return updatedSettings;
  }

  async updateByUserId(
    userId: string,
    updateNotificationSettingsDto: UpdateNotificationSettingsDto,
  ): Promise<INotificationSettings> {
    const updatedSettings = await this.notificationSettingsModel
      .findOneAndUpdate(
        { user_id: userId, is_deleted: false },
        {
          ...updateNotificationSettingsDto,
          updated_by: userId,
        },
        { new: true },
      )
      .exec();

    if (!updatedSettings) {
      throw new NotFoundException('Notification settings not found');
    }

    return updatedSettings;
  }

  async remove(id: string, userId: string): Promise<void> {
    const deletedSettings = await this.notificationSettingsModel
      .findOneAndUpdate(
        { _id: id, is_deleted: false },
        {
          is_deleted: true,
          updated_by: userId,
        },
        { new: true },
      )
      .exec();

    if (!deletedSettings) {
      throw new NotFoundException('Notification settings not found');
    }
  }

  async removeByUserId(userId: string): Promise<void> {
    const deletedSettings = await this.notificationSettingsModel
      .findOneAndUpdate(
        { user_id: userId, is_deleted: false },
        {
          is_deleted: true,
          updated_by: userId,
        },
        { new: true },
      )
      .exec();

    if (!deletedSettings) {
      throw new NotFoundException('Notification settings not found');
    }
  }
} 