import { Connection } from 'mongoose';
import { NotificationSchema } from './notifications.schema';
import { NOTIFICATIONS_COLLECTION, NOTIFICATIONS_PROVIDER_TOKEN } from './notifications.constants';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';

export const NotificationModel = [
  {
    provide: NOTIFICATIONS_PROVIDER_TOKEN,
    useFactory: (connection: Connection) => connection.model(NOTIFICATIONS_COLLECTION, NotificationSchema),
    inject: [CONNECTION_PROVIDER],
  },
]; 