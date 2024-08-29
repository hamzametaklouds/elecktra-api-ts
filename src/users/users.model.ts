import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { UsersSchema } from './users.schema';
import { USERS_COLLECTION } from './users.constants';
import { USERS_PROVIDER_TOKEN } from './users.constants';

export const UsersModel = [
  {
    provide: USERS_PROVIDER_TOKEN,
    useFactory: async (connection: Connection) => connection.model(USERS_COLLECTION, UsersSchema),
    inject: [CONNECTION_PROVIDER],
  },
];
