import { Injectable, Inject, BadRequestException, forwardRef } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { CreateBookingsDto } from './dtos/create-bookings.dto';
import { BOOKINGS_PROVIDER_TOKEN } from './bookings.constants';
import { BookingStatus, IBookings, IPayment } from './bookings.schema';
import { StripeService } from 'src/stripe/stripe.service';
import { HotelAndCarsService } from 'src/hotel-and-cars/hotel-and-cars.service';
import { CreatePaymentIntentDto } from './dtos/create-payment-intent';
import { CreatePaymentDto } from './dtos/create-payment';

@Injectable()
export class BookingsService {

    constructor(
        @Inject(BOOKINGS_PROVIDER_TOKEN)
        private bookingModel: Model<IBookings>,
        @Inject(forwardRef(() => StripeService))
        private stripeService: StripeService,
        private hotelAndCarService: HotelAndCarsService
    ) { }


    async getBookingById(id) {

        return await this.bookingModel.findOne({ _id: id, is_deleted: false })

    }

    async updateBooking(body: IPayment, booking_id) {

        return await this.bookingModel.findByIdAndUpdate({ _id: booking_id }, { payment: body, status: BookingStatus.C })

    }


    async insertBooking(body: CreateBookingsDto, user: { userId?: ObjectId }) {

        const {
            hotel_or_car,
            start_date,
            end_date,
            adults,
            children,
            infants,
        } = body;

        const hotelExists = await this.hotelAndCarService.getHotelOrCarById(hotel_or_car)

        if (!hotelExists) {
            throw new BadRequestException('Invalid hotel Id')
        }

        const reference_number = Array.from({ length: 15 }, () => 'abcdefghijk123455678990lmnopqr0928340483stuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]).join('').toLowerCase();


        const start = new Date(start_date);
        const end = new Date(end_date);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Invalid date format');
        }

        // Get the difference in time (milliseconds) between the two dates
        const diffInMs = end.getTime() - start.getTime();

        // Convert milliseconds to days
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        console.log(diffInDays)

        let sub_total = hotelExists?.price * diffInDays

        const tax = sub_total * 0.17

        sub_total = sub_total + tax


        console.log()


        const booking = await new this.bookingModel(
            {
                hotel_or_car,
                start_date,
                end_date,
                reference_number: reference_number,
                guests: {
                    adults: adults,
                    children: children,
                    infants: infants
                },
                taxes_and_fees: {
                    tax_percentage: 17,
                    total_tax_applied: tax
                },
                sub_total: sub_total,
                nights: diffInDays,
                created_by: user.userId ? user.userId : null
            }).save();


        // const intent = await this.stripeService.createPaymentIntent((parseFloat((sub_total * 100).toFixed(2))), 'usd')

        // console.log('intent-----', intent)

        return booking

    }

    async verifyPayment(body: CreatePaymentDto, user: { userId?: ObjectId }) {

        try {
            const intent = await this.stripeService.createPaymentIntentPro(body, user)

            return intent

        }
        catch (err) {
            throw new BadRequestException(err)
        }


    }


}
