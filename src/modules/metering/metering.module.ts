import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { EventHandlerService } from './services/event-handler.service';
import { BillingService } from './services/billing.service';
import { SecurityService } from './services/security.service';
import { KpiRegistryService } from './services/kpi-registry.service';
import { AgentValidationService } from './services/agent-validation.service';
import { AgentEventsController } from './controllers/agent-events.controller';
import { KpiManagementController } from './controllers/kpi-management.controller';
import { MeteringModels } from './metering.model';

@Module({
  imports: [
    DatabaseModule,
  ],
  providers: [
    EventHandlerService, 
    BillingService, 
    SecurityService, 
    KpiRegistryService,
    AgentValidationService,
    ...MeteringModels,
  ],
  controllers: [AgentEventsController, KpiManagementController],
  exports: [BillingService, KpiRegistryService, AgentValidationService, ...MeteringModels],
})
export class MeteringModule {}
