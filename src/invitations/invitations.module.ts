import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { InvitationsController } from './invitations.controller';
import { InvitationsModel } from './invitations.model';
import { InvitationsService } from './invitations.service';
import { CompaniesModule } from 'src/companies/companies.module';
import { SystemUsersModule } from 'src/system-users/system-users.module';

@Module({
  imports: [DatabaseModule, ConfigModule, CompaniesModule, forwardRef(() => SystemUsersModule)],
  controllers: [InvitationsController],
  providers: [InvitationsService, ...InvitationsModel],
  exports: [InvitationsService]
})
export class InvitationsModule { }
