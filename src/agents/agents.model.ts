import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { AgentSchema } from './agents.schema';
import { AGENTS_COLLECTION, AGENTS_PROVIDER_TOKEN } from './agents.constants';

export const AgentsModel = [
  {
    provide: AGENTS_PROVIDER_TOKEN,
    useFactory: async (connection: Connection) => 
      connection.model(AGENTS_COLLECTION, AgentSchema),
    inject: [CONNECTION_PROVIDER],
  },
]; 