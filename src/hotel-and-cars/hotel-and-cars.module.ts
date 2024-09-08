import { Module } from '@nestjs/common';
import { HotelAndCarsController } from './hotel-and-cars.controller';
import { HotelAndCarsService } from './hotel-and-cars.service';
import { DatabaseModule } from 'src/database/database.module';
import { HotelAndCarModel } from './hotel-and-cars.model';

@Module({
  imports: [DatabaseModule],
  controllers: [HotelAndCarsController],
  providers: [HotelAndCarsService, ...HotelAndCarModel]
})
export class HotelAndCarsModule { }
