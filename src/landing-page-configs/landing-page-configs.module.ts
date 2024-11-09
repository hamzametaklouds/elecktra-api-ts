import { Module } from '@nestjs/common';
import { LandingPageConfigsController } from './landing-page-configs.controller';
import { LandingPageConfigsService } from './landing-page-configs.service';

@Module({
  controllers: [LandingPageConfigsController],
  providers: [LandingPageConfigsService]
})
export class LandingPageConfigsModule {}
