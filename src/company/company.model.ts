import { Connection } from 'mongoose';
import { CompanySchema } from './company.schema';
import { COMPANY_PROVIDER_TOKEN } from './company.constants';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';

export const CompanyModel = [
  {
    provide: COMPANY_PROVIDER_TOKEN,
    useFactory: (connection: Connection) => connection.model('Company', CompanySchema),
    inject: [CONNECTION_PROVIDER],
  },
]; 