import { Module } from '@nestjs/common';
import { RatingReviewsController } from './rating-reviews.controller';
import { RatingReviewsService } from './rating-reviews.service';
import { DatabaseModule } from 'src/database/database.module';
import { RatingReviewsModel } from './rating-reviews.model';

@Module({
  imports: [DatabaseModule],
  controllers: [RatingReviewsController],
  providers: [RatingReviewsService, ...RatingReviewsModel],
  exports: [RatingReviewsService]
})
export class RatingReviewsModule { }
