import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { CreateRatingReviewDto } from './dtos/create-rating-reviews.dto';
import { RATING_REVIEWS_PROVIDER_TOKEN } from './rating-reviews.constant';
import { IReviewAndRatings } from './rating-reviews.schema';
import { BookingsService } from 'src/bookings/bookings.service';
import { CreateCustomRatingReviewDto } from './dtos/create-custom-rating-reviews.dto';
import { UpdateCustomRatingReviewDto } from './dtos/update-custom-rating-reviews.dto';

@Injectable()
export class RatingReviewsService {

    constructor(
        @Inject(RATING_REVIEWS_PROVIDER_TOKEN)
        private ratingAndReviewsModel: Model<IReviewAndRatings>,
        private bookingService: BookingsService
    ) { }


    async getCustomeReviews() {
        return await this.ratingAndReviewsModel
            .find({ custom_review: true, is_deleted: false }, { custom_review: 0, __v: 0, updatedAt: 0, booking_id: 0, hotel_or_car: 0, created_by: 0, updated_at: 0, updated_by: 0 })
    }



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

        // if (endsDate >= currentDate) {
        //     throw new BadRequestException('Review cannot be placed as the booking has not yet ended');
        // }

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


    async insertCustomRatingReview(body: CreateCustomRatingReviewDto, user: { userId?: ObjectId }) {

        const {
            review,
            rating,
            image,
            name,
            user_type,
            designation
        } = body;


        const screen = await new this.ratingAndReviewsModel(
            {
                review,
                rating,
                image,
                name,
                user_type,
                designation,
                custom_review: true,
                created_by: user?.userId || null
            }).save();

        return screen

    }

    async updateCustomRatingReview(id, body: UpdateCustomRatingReviewDto, user: { userId?: ObjectId }) {

        const customReview = await this.ratingAndReviewsModel.findOne({ _id: id, is_deleted: false })

        if (!customReview) {
            throw new BadRequestException('Invalid Id')
        }

        const {
            review,
            rating,
            image,
            name,
            user_type,
            designation,
            is_deleted,
            is_disabled

        } = body;


        const screen = await this.ratingAndReviewsModel.findByIdAndUpdate(
            {
                _id: customReview._id
            },
            {
                review,
                rating,
                image,
                name,
                user_type,
                designation,
                custom_review: true,
                is_deleted,
                is_disabled,
                updated_by: user?.userId || null
            },
            {
                new: true
            }
        )

        return screen

    }


}
