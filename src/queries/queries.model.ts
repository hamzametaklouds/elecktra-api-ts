import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { QUERY_COLLECTION, QUERY_PROVIDER_TOKEN } from './queries.constants';
import { QuerySchema } from './queries.schema';

export const QueryModel = [
    {
        provide: QUERY_PROVIDER_TOKEN,
        useFactory: async (connection: Connection) => connection.model(QUERY_COLLECTION, QuerySchema),
        inject: [CONNECTION_PROVIDER],
    },
];
