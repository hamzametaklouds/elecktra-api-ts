import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { InvitationsController } from './invitations.controller';
import { InvitationsModel } from './invitations.model';
import { InvitationsService } from './invitations.service';
import { CompaniesModule } from 'src/companies/companies.module';

@Module({
  imports: [DatabaseModule, ConfigModule, CompaniesModule],
  controllers: [InvitationsController],
  providers: [InvitationsService, ...InvitationsModel],
  exports: [InvitationsService]
})
export class InvitationsModule { }
