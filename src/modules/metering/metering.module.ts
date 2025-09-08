import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from 'src/database/database.module';
import { EventHandlerService } from './services/event-handler.service';
import { BillingService } from './services/billing.service';
import { SecurityService } from './services/security.service';
import { KpiRegistryService } from './services/kpi-registry.service';
import { AgentValidationService } from './services/agent-validation.service';
import { IncompleteJobsService } from './services/incomplete-jobs.service';
import { AgentEventsController } from './controllers/agent-events.controller';
import { KpiManagementController } from './controllers/kpi-management.controller';
import { KpisController } from './controllers/kpis.controller';
import { IncompleteJobsController } from './controllers/incomplete-jobs.controller';
import { MeteringModels } from './metering.model';

@Module({
  imports: [
    DatabaseModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    EventHandlerService, 
    BillingService, 
    SecurityService, 
    KpiRegistryService,
    AgentValidationService,
    IncompleteJobsService,
    ...MeteringModels,
  ],
  controllers: [AgentEventsController, KpiManagementController, KpisController, IncompleteJobsController],
  exports: [BillingService, KpiRegistryService, AgentValidationService, IncompleteJobsService, ...MeteringModels],
})
export class MeteringModule {}
