import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { IntegrationSchema } from './integrations.schema';
import { INTEGRATIONS_COLLECTION, INTEGRATIONS_PROVIDER_TOKEN } from './integrations.constants';

export const IntegrationsModel = [
  {
    provide: INTEGRATIONS_PROVIDER_TOKEN,
    useFactory: async (connection: Connection) => 
      connection.model(INTEGRATIONS_COLLECTION, IntegrationSchema),
    inject: [CONNECTION_PROVIDER],
  },
]; 