import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { DESTINATIONS_COLLECTION, DESTINATIONS_PROVIDER_TOKEN } from './destinations.constants';
import { DestinationSchema } from './destinations.schema';

export const DestinationsModel = [
    {
        provide: DESTINATIONS_PROVIDER_TOKEN,
        useFactory: async (connection: Connection) => connection.model(DESTINATIONS_COLLECTION, DestinationSchema),
        inject: [CONNECTION_PROVIDER],
    },
];
