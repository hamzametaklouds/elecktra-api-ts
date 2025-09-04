import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { AgentsModel } from './agents.model';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { ToolsModule } from 'src/tools/tools.module';
import { InvitationsModule } from 'src/invitations/invitations.module';
import { TagsModule } from 'src/tags/tags.module';
import { MeteringModule } from 'src/modules/metering/metering.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    ToolsModule,
    forwardRef(() => InvitationsModule),
    TagsModule,
    MeteringModule,
  ],
  controllers: [AgentsController],
  providers: [AgentsService, ...AgentsModel],
  exports: [AgentsService]
})
export class AgentsModule {} 