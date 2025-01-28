import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { APP_CONFIGS_COLLECTION, APP_CONFIGS_PROVIDER_TOKEN, LANDING_PAGE_CONFIGS_COLLECTION, LANDING_PAGE_CONFIGS_PROVIDER_TOKEN } from './landing-page-configs.constants';
import { AppConfigsSchema } from './app-configuration';

export const APPConfigsModel = [
    {
        provide: APP_CONFIGS_PROVIDER_TOKEN,
        useFactory: async (connection: Connection) => connection.model(APP_CONFIGS_COLLECTION, AppConfigsSchema),
        inject: [CONNECTION_PROVIDER],
    },
];
