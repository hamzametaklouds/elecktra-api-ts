import { Module } from '@nestjs/common';
import { OptionsController } from './options.controller';
import { OptionsService } from './options.service';
import { DatabaseModule } from 'src/database/database.module';
import { OptionsModel } from './options.model';

@Module({
  imports: [DatabaseModule],
  controllers: [OptionsController],
  providers: [OptionsService, ...OptionsModel],
  exports: [OptionsService]
})
export class OptionsModule { }
