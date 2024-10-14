import { Injectable, Inject } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { CreateBookingsDto } from './dtos/create-bookings.dto';
import { BOOKINGS_PROVIDER_TOKEN } from './bookings.constants';
import { IBookings } from './bookings.schema';
import { PlanTripDto } from '../hotel-and-cars/dtos/book-trip.dto';

@Injectable()
export class BookingsService {

    constructor(
        @Inject(BOOKINGS_PROVIDER_TOKEN)
        private bookingModel: Model<IBookings>
    ) { }


    async insertBooking(body: CreateBookingsDto, user: { userId?: ObjectId }) {

        const {
            hotel_or_car,
            rooms_reserved,
            start_date,
            end_date,
            adults,
            children,
            infants,
            nights,
        } = body;

        const booking = await new this.bookingModel(
            {
                hotel_or_car,
                rooms_reserved,
                start_date,
                end_date,
                guests: {
                    adults: adults,
                    children: children,
                    infants: infants
                },
                nights,
                created_by: user.userId ? user.userId : null
            }).save();


        return booking

    }

}
