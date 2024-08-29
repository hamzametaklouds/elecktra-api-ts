import { Controller, Get, Inject } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import * as mongoose from 'mongoose';

import { CONNECTION_PROVIDER } from 'src/database/database.constants';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(CONNECTION_PROVIDER)
    private connection: typeof mongoose,
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () =>
        this.db.pingCheck('db', { connection: this.connection.connection }),
      async () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
      async () => this.memory.checkRSS('memory_rss', 3000 * 1024 * 1024),
    ]);
  }
}
