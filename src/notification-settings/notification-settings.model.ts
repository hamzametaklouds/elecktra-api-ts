import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { NotificationSettingsSchema } from './notification-settings.schema';
import { NOTIFICATION_SETTINGS_COLLECTION, NOTIFICATION_SETTINGS_PROVIDER_TOKEN } from './notification-settings.constants';

export const NotificationSettingsModel = [
  {
    provide: NOTIFICATION_SETTINGS_PROVIDER_TOKEN,
    useFactory: async (connection: Connection) => connection.model(NOTIFICATION_SETTINGS_COLLECTION, NotificationSettingsSchema),
    inject: [CONNECTION_PROVIDER],
  },
]; 