import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { OPTIONS_COLLECTION, OPTIONS_PROVIDER_TOKEN } from './options.constants';
import { OptionSchema } from './options.schema';

export const OptionsModel = [
    {
        provide: OPTIONS_PROVIDER_TOKEN,
        useFactory: async (connection: Connection) => connection.model(OPTIONS_COLLECTION, OptionSchema),
        inject: [CONNECTION_PROVIDER],
    },
];
