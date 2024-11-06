import { Module, forwardRef } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { DatabaseModule } from 'src/database/database.module';
import { CompaniesModel } from './companies.model';
import { SystemUsersModule } from 'src/system-users/system-users.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => SystemUsersModule)],
  controllers: [CompaniesController],
  providers: [CompaniesService, ...CompaniesModel],
  exports: [CompaniesService]
})
export class CompaniesModule { }
