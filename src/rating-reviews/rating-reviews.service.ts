import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { CreateRatingReviewDto } from './dtos/create-rating-reviews.dto';
import { RATING_REVIEWS_PROVIDER_TOKEN } from './rating-reviews.constant';
import { IReviewAndRatings } from './rating-reviews.schema';
import { BookingsService } from 'src/bookings/bookings.service';

@Injectable()
export class RatingReviewsService {

    constructor(
        @Inject(RATING_REVIEWS_PROVIDER_TOKEN)
        private ratingAndReviewsModel: Model<IReviewAndRatings>,
        private bookingService: BookingsService
    ) { }



    async insertRatingReview(body: CreateRatingReviewDto, user: { userId?: ObjectId }) {

        const {
            review,
            rating,
            hotel_or_car,
            booking_id
        } = body;


        const bookingExists = await this.bookingService.getBookingById(booking_id)

        if (!bookingExists) {
            throw new BadRequestException('Invalid booking id')
        }

        const currentDate = new Date();
        const endsDate = new Date(bookingExists.end_date);

        if (endsDate >= currentDate) {
            throw new BadRequestException('Review cannot be placed as the booking has not yet ended');
        }

        const screen = await new this.ratingAndReviewsModel(
            {
                review,
                rating,
                hotel_or_car,
                booking_id,
                created_by: user?.userId || null
            }).save();

        return screen

    }


}
