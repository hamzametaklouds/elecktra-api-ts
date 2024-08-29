import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { SCREEN_CONFIGS_COLLECTION, SCREEN_CONFIGS_PROVIDER_TOKEN } from './screen-configs.constants';
import { ScreenConfigSchema } from './screen-configs.schema';

export const ScreenConfigModel = [
    {
        provide: SCREEN_CONFIGS_PROVIDER_TOKEN,
        useFactory: async (connection: Connection) => connection.model(SCREEN_CONFIGS_COLLECTION, ScreenConfigSchema),
        inject: [CONNECTION_PROVIDER],
    },
];
