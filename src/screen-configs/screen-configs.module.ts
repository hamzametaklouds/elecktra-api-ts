import { Module } from '@nestjs/common';
import { ScreenConfigsController } from './screen-configs.controller';
import { ScreenConfigsService } from './screen-configs.service';
import { DatabaseModule } from 'src/database/database.module';
import { ScreenConfigModel } from './screen-configs.model';

@Module({
  imports: [DatabaseModule],
  controllers: [ScreenConfigsController],
  providers: [ScreenConfigsService, ...ScreenConfigModel]
})
export class ScreenConfigsModule { }
