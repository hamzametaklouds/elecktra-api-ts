import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { UsersController } from './users.controller';
import { UsersModel } from './users.model';
import { UsersService } from './users.service';
import { QueriesModule } from 'src/queries/queries.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    QueriesModule,
    forwardRef(() => StripeModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, ...UsersModel],
  exports: [UsersService]
})
export class UsersModule { }
