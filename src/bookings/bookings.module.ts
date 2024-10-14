import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { DatabaseModule } from 'src/database/database.module';
import { BookingModel } from './bookings.model';
import { StripeModule } from 'src/stripe/stripe.module';
import { HotelAndCarsModule } from 'src/hotel-and-cars/hotel-and-cars.module';

@Module({
  imports: [DatabaseModule, StripeModule, HotelAndCarsModule],
  controllers: [BookingsController],
  providers: [BookingsService, ...BookingModel]
})
export class BookingsModule { }
