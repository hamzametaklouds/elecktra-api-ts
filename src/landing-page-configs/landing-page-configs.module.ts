import { Module } from '@nestjs/common';
import { LandingPageConfigsController } from './landing-page-configs.controller';
import { LandingPageConfigsService } from './landing-page-configs.service';
import { DatabaseModule } from 'src/database/database.module';
import { LandingPageConfigsModel } from './landing-page-configs.model';
import { APPConfigsModel } from './app-configs.model';

@Module({
  imports: [DatabaseModule],
  controllers: [LandingPageConfigsController],
  providers: [LandingPageConfigsService, ...LandingPageConfigsModel,...APPConfigsModel]
})
export class LandingPageConfigsModule { }
