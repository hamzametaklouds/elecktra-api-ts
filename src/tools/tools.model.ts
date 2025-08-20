import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { ToolSchema } from './tools.schema';
import { TOOLS_COLLECTION, TOOLS_PROVIDER_TOKEN } from './tools.constants';

export const ToolsModel = [
  {
    provide: TOOLS_PROVIDER_TOKEN,
    useFactory: async (connection: Connection) =>
      connection.model(TOOLS_COLLECTION, ToolSchema),
    inject: [CONNECTION_PROVIDER],
  },
];