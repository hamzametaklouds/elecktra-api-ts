import { Module, forwardRef } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { DatabaseModule } from 'src/database/database.module';
import { BookingModel } from './bookings.model';
import { StripeModule } from 'src/stripe/stripe.module';
import { HotelAndCarsModule } from 'src/hotel-and-cars/hotel-and-cars.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => StripeModule), HotelAndCarsModule, UsersModule],
  controllers: [BookingsController],
  providers: [BookingsService, ...BookingModel],
  exports: [BookingsService]
})
export class BookingsModule { }
