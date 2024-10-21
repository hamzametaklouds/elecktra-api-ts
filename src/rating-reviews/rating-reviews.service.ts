import { Injectable, Inject } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { CreateRatingReviewDto } from './dtos/create-rating-reviews.dto';
import { RATING_REVIEWS_PROVIDER_TOKEN } from './rating-reviews.constant';
import { IReviewAndRatings } from './rating-reviews.schema';

@Injectable()
export class RatingReviewsService {

    constructor(
        @Inject(RATING_REVIEWS_PROVIDER_TOKEN)
        private ratingAndReviewsModel: Model<IReviewAndRatings>
    ) { }



    async insertRatingReview(body: CreateRatingReviewDto, user: { userId?: ObjectId }) {

        const {
            review,
            rating,
            hotel_or_car,
            booking_id
        } = body;

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
