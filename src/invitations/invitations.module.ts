import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { InvitationsController } from './invitations.controller';
import { InvitationsModel } from './invitations.model';
import { InvitationsService } from './invitations.service';
import { UsersModule } from 'src/users/users.module';
@Module({
  imports: [DatabaseModule, ConfigModule, UsersModule],
  controllers: [InvitationsController],
  providers: [InvitationsService, ...InvitationsModel],
  exports: [InvitationsService]
})
export class InvitationsModule { }
