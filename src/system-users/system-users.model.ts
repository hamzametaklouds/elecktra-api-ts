import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { SystemUsersSchema } from './system-users.schema';
import { SYSTEM_USERS_COLLECTION,SYSTEM_USERS_PROVIDER_TOKEN } from './system-users.constant';

export const SystemUsersModel = [
  {
    provide: SYSTEM_USERS_PROVIDER_TOKEN,
    useFactory: async (connection: Connection) => connection.model(SYSTEM_USERS_COLLECTION, SystemUsersSchema),
    inject: [CONNECTION_PROVIDER],
  },
];
