import { Module, forwardRef } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { DatabaseModule } from 'src/database/database.module';
import { CompanyModel } from './company.model';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => ChatModule),
  ],
  controllers: [CompanyController],
  providers: [CompanyService, ...CompanyModel],
  exports: [CompanyService],
})
export class CompanyModule {} 