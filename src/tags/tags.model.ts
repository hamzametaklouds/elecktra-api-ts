import { Connection, Model } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { TagSchema, ITag } from './tags.schema';
import { TAGS_COLLECTION, TAGS_PROVIDER_TOKEN } from './tags.constants';

export const TagsProviders = [
  {
    provide: TAGS_PROVIDER_TOKEN,
    useFactory: async (connection: Connection) => 
      connection.model(TAGS_COLLECTION, TagSchema),
    inject: [CONNECTION_PROVIDER],
  },
];

export type TagsModel = Model<ITag>; 