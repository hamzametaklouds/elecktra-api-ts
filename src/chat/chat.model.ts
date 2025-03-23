import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { CHAT_CHANNELS_COLLECTION, CHAT_CHANNELS_PROVIDER_TOKEN } from './chat.constants';
import { MessageSchema } from './messages.schema';

export const ChatModel = [
  {
    provide: CHAT_CHANNELS_PROVIDER_TOKEN,
    useFactory: (connection: Connection) => 
      connection.model(CHAT_CHANNELS_COLLECTION, MessageSchema),
    inject: [CONNECTION_PROVIDER],
  },
]; 