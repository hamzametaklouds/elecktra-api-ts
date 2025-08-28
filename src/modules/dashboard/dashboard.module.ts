import { Module, CacheModule } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60, // 60 seconds cache TTL
      max: 100, // maximum number of items in cache
      store: 'memory',
    }),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService]
})
export class DashboardModule {} 