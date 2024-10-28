import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { DatabaseModule } from 'src/database/database.module';
import { CompaniesModel } from './companies.model';

@Module({
  imports: [DatabaseModule],
  controllers: [CompaniesController],
  providers: [CompaniesService, ...CompaniesModel],
  exports: [CompaniesService]
})
export class CompaniesModule { }
