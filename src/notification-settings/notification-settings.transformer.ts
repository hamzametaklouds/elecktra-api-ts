import { INotificationSettings } from './notification-settings.schema';
import { NotificationSettingsResponseDto } from './dtos/notification-settings-response.dto';

export class NotificationSettingsTransformer {
  static toResponseDto(settings: INotificationSettings): NotificationSettingsResponseDto {
    return {
      _id: settings._id?.toString() || '',
      user_id: settings.user_id?.toString() || '',
      desktop_notifications: settings.desktop_notifications,
      purchase_notifications: settings.purchase_notifications,
      all_notifications: settings.all_notifications,
      created_at: settings.created_at,
      updated_at: settings.updated_at,
    };
  }

  static toResponseDtoArray(settings: INotificationSettings[]): NotificationSettingsResponseDto[] {
    return settings.map(setting => this.toResponseDto(setting));
  }
} 