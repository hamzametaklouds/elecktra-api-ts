import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { ChatChannelSchema } from './chat-channel.schema';
import { CHAT_CHANNELS_COLLECTION, CHAT_CHANNELS_PROVIDER_TOKEN } from './chat.constants';

export const ChatModel = [
  {
    provide: CHAT_CHANNELS_PROVIDER_TOKEN,
    useFactory: (connection: Connection) => 
      connection.model(CHAT_CHANNELS_COLLECTION, ChatChannelSchema),
    inject: [CONNECTION_PROVIDER],
  },
]; 