import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { COMPANIES_COLLECTION, COMPANIES_PROVIDER_TOKEN } from './companies.constant';
import { CompaniesSchema } from './companies.schema';

export const CompaniesModel = [
    {
        provide: COMPANIES_PROVIDER_TOKEN,
        useFactory: async (connection: Connection) => connection.model(COMPANIES_COLLECTION, CompaniesSchema),
        inject: [CONNECTION_PROVIDER],
    },
];
