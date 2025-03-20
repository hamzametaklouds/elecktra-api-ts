import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { MessageSchema } from './messages.schema';
import { MESSAGES_COLLECTION, MESSAGES_PROVIDER_TOKEN } from './chat.constants';

export const MessagesModel = [
  {
    provide: MESSAGES_PROVIDER_TOKEN,
    useFactory: (connection: Connection) => 
      connection.model(MESSAGES_COLLECTION, MessageSchema),
    inject: [CONNECTION_PROVIDER],
  },
]; 