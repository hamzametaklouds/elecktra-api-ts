import { Module } from '@nestjs/common';
import { QueriesController } from './queries.controller';
import { QueriesService } from './queries.service';
import { DatabaseModule } from 'src/database/database.module';
import { QueryModel } from './queries.model';

@Module({
  imports: [DatabaseModule],
  controllers: [QueriesController],
  providers: [QueriesService, ...QueryModel]
})
export class QueriesModule { }
