import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { DeliveredAgentSchema } from './delivered-agents.schema';
import { DELIVERED_AGENTS_COLLECTION, DELIVERED_AGENTS_PROVIDER_TOKEN } from './delivered-agents.constants';

export const DeliveredAgentsModel = [
  {
    provide: DELIVERED_AGENTS_PROVIDER_TOKEN,
    useFactory: (connection: Connection) => 
      connection.model(DELIVERED_AGENTS_COLLECTION, DeliveredAgentSchema),
    inject: [CONNECTION_PROVIDER],
  },
]; 