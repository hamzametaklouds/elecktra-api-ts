import { Module } from '@nestjs/common';
import { RecentSearchsController } from './recent-searchs.controller';
import { RecentSearchsService } from './recent-searchs.service';
import { DatabaseModule } from 'src/database/database.module';
import { RecentSearchsModel } from './recent-searchs.model';

@Module({
  imports: [DatabaseModule],
  controllers: [RecentSearchsController],
  providers: [RecentSearchsService, ...RecentSearchsModel],
  exports: [RecentSearchsService]

})
export class RecentSearchsModule { }
