import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { DatabaseModule } from 'src/database/database.module';
import { NotificationModel } from './notifications.model';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, ...NotificationModel],
  exports: [NotificationsService],
})
export class NotificationsModule {} 