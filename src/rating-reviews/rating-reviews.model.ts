import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { RATING_REVIEWS_PROVIDER_TOKEN, RATING_REVIWS_COLLECTION } from './rating-reviews.constant';
import { ReviewAndRatingSchema } from './rating-reviews.schema';

export const RatingReviewsModel = [
    {
        provide: RATING_REVIEWS_PROVIDER_TOKEN,
        useFactory: async (connection: Connection) => connection.model(RATING_REVIWS_COLLECTION, ReviewAndRatingSchema),
        inject: [CONNECTION_PROVIDER],
    },
];
