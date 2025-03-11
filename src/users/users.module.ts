import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { UsersController } from './users.controller';
import { UsersModel } from './users.model';
import { UsersService } from './users.service';
import { InvitationsModule } from 'src/invitations/invitations.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    forwardRef(() => InvitationsModule),
  
  ],
  controllers: [UsersController],
  providers: [UsersService, ...UsersModel],
  exports: [UsersService]
})
export class UsersModule { }
