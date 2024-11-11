import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { LANDING_PAGE_CONFIGS_COLLECTION, LANDING_PAGE_CONFIGS_PROVIDER_TOKEN } from './landing-page-configs.constants';
import { LandingPageConfigsSchema } from './landing-page-configs.schema';

export const LandingPageConfigsModel = [
    {
        provide: LANDING_PAGE_CONFIGS_PROVIDER_TOKEN,
        useFactory: async (connection: Connection) => connection.model(LANDING_PAGE_CONFIGS_COLLECTION, LandingPageConfigsSchema),
        inject: [CONNECTION_PROVIDER],
    },
];
