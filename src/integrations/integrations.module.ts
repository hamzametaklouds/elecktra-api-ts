import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { IntegrationsService } from './integrations.service';
import { IntegrationsModel } from './integrations.model';
import { IntegrationsController } from './integrations.controller';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
  ],
  controllers: [IntegrationsController],
  providers: [IntegrationsService, ...IntegrationsModel],
  exports: [IntegrationsService]
})
export class IntegrationsModule {} 