import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { UsersController } from './users.controller';
import { UsersModel } from './users.model';
import { UsersService } from './users.service';
import { QueriesModule } from 'src/queries/queries.module';

@Module({
  imports: [DatabaseModule, ConfigModule, QueriesModule],
  controllers: [UsersController],
  providers: [UsersService, ...UsersModel],
  exports: [UsersService]

})
export class UsersModule { }
