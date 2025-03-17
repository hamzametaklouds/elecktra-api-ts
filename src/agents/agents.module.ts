import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { AgentsModel } from './agents.model';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
  ],
  controllers: [AgentsController],
  providers: [AgentsService, ...AgentsModel],
  exports: [AgentsService]
})
export class AgentsModule {} 