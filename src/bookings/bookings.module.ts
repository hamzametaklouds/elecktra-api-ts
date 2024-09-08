import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { DatabaseModule } from 'src/database/database.module';
import { BookingModel } from './bookings.model';

@Module({
  imports: [DatabaseModule],
  controllers: [BookingsController],
  providers: [BookingsService, ...BookingModel]
})
export class BookingsModule { }
