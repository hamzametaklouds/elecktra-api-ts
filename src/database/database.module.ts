import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as mongoose from 'mongoose';
import { CONNECTION_PROVIDER } from './database.constants';

const DBConnectionProvider = {
  provide: CONNECTION_PROVIDER,
  useFactory: async (config: ConfigService): Promise<typeof mongoose> => {
    const conn = await mongoose.connect(config.get('db.connectionUrl'));
    return conn;
  },
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule],
  exports: [DBConnectionProvider],
  providers: [DBConnectionProvider],
})
export class DatabaseModule {}
