import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { InvitationsSchema } from './invitations.schema';
import { INVITATIONS_COLLECTION,INVITATIONS_PROVIDER_TOKEN } from './invitations.constants';

export const InvitationsModel = [
  {
    provide: INVITATIONS_PROVIDER_TOKEN,
    useFactory: async (connection: Connection) => connection.model(INVITATIONS_COLLECTION, InvitationsSchema),
    inject: [CONNECTION_PROVIDER],
  },
];
