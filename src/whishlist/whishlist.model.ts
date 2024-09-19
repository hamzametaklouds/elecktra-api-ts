import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { WHISHLIST_COLLECTION, WHISHLIST_PROVIDER_TOKEN } from './whishlist.constants';
import { WhishlistSchema } from './whishlist.schema';

export const WhishlistModel = [
    {
        provide: WHISHLIST_PROVIDER_TOKEN,
        useFactory: async (connection: Connection) => connection.model(WHISHLIST_COLLECTION, WhishlistSchema),
        inject: [CONNECTION_PROVIDER],
    },
];
