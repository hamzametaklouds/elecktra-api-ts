import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';

import { HealthController } from './health.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [HealthController],
  imports: [TerminusModule, ConfigModule, DatabaseModule],
})
export class HealthModule {}
