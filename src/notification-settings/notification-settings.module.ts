import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { NotificationSettingsController } from './notification-settings.controller';
import { NotificationSettingsService } from './notification-settings.service';
import { NotificationSettingsModel } from './notification-settings.model';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationSettingsController],
  providers: [NotificationSettingsService, ...NotificationSettingsModel],
  exports: [NotificationSettingsService],
})
export class NotificationSettingsModule {} 