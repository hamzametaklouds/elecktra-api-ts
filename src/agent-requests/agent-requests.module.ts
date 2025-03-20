import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { AgentRequestsModel } from './agent-requests.model';
import { AgentsModule } from 'src/agents/agents.module';
import { AgentRequestsController } from './agent-requests.controller';
import { AgentRequestsService } from './agent-requests.service';
import { CompanyModule } from 'src/company/company.module';
import { DeliveredAgentsModule } from 'src/delivered-agents/delivered-agents.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    AgentsModule, // Import AgentsModule to use its service
    forwardRef(() => CompanyModule),
    forwardRef(() => DeliveredAgentsModule),
  ],
  controllers: [AgentRequestsController],
  providers: [AgentRequestsService, ...AgentRequestsModel],
  exports: [AgentRequestsService]
})
export class AgentRequestsModule {} 