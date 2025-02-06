import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { FEATURED_CITIES_COLLECTION, FEATURED_CITIES_PROVIDER_TOKEN } from './featured-cities.constants';
import { FeaturedCitiesSchema } from './featured-cities.schema';

export const FeaturedCitiesModel = [
    {
        provide: FEATURED_CITIES_PROVIDER_TOKEN,
        useFactory: async (connection: Connection) => connection.model(FEATURED_CITIES_COLLECTION, FeaturedCitiesSchema),
        inject: [CONNECTION_PROVIDER],
    },
]; 