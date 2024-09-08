import { Module } from '@nestjs/common';
import { DestinationsController } from './destinations.controller';
import { DestinationsService } from './destinations.service';
import { DatabaseModule } from 'src/database/database.module';
import { DestinationsModel } from './destinations.model';

@Module({
  imports: [DatabaseModule],
  controllers: [DestinationsController],
  providers: [DestinationsService, ...DestinationsModel],
  exports: [DestinationsService]
})
export class DestinationsModule { }
