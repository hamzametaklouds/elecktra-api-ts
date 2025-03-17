import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { AgentRequestSchema } from './agent-requests.schema';
import { AGENT_REQUESTS_COLLECTION, AGENT_REQUESTS_PROVIDER_TOKEN } from './agent-requests.constants';

export const AgentRequestsModel = [
  {
    provide: AGENT_REQUESTS_PROVIDER_TOKEN,
    useFactory: async (connection: Connection) => 
      connection.model(AGENT_REQUESTS_COLLECTION, AgentRequestSchema),
    inject: [CONNECTION_PROVIDER],
  },
]; 