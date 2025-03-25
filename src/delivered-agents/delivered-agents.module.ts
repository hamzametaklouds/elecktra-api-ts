import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { DeliveredAgentsController } from './delivered-agents.controller';
import { DeliveredAgentsService } from './delivered-agents.service';
import { DeliveredAgentsModel } from './delivered-agents.model';
import { AgentRequestsModule } from 'src/agent-requests/agent-requests.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    forwardRef(() => AgentRequestsModule),
 
  ],
  controllers: [DeliveredAgentsController],
  providers: [DeliveredAgentsService, ...DeliveredAgentsModel],
  exports: [DeliveredAgentsService]
})
export class DeliveredAgentsModule {} 