import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { RECENT_SEARCHS_COLLECTION, RECENT_SEARCHS_PROVIDER_TOKEN } from './recent-searchs.constants';
import { RecentSearchSchema } from './recent-searchs.schema';

export const RecentSearchsModel = [
    {
        provide: RECENT_SEARCHS_PROVIDER_TOKEN,
        useFactory: async (connection: Connection) => connection.model(RECENT_SEARCHS_COLLECTION, RecentSearchSchema),
        inject: [CONNECTION_PROVIDER],
    },
];
