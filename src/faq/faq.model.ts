import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { FAQ_COLLECTION, FAQ_PROVIDER_TOKEN } from './faq.constants';
import { FAQSchema } from './faq.schema';

export const FAQModel = [
    {
        provide: FAQ_PROVIDER_TOKEN,
        useFactory: async (connection: Connection) => connection.model(FAQ_COLLECTION, FAQSchema),
        inject: [CONNECTION_PROVIDER],
    },
]; 