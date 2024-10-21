import { Test, TestingModule } from '@nestjs/testing';
import { RatingReviewsController } from './rating-reviews.controller';

describe('RatingReviewsController', () => {
  let controller: RatingReviewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatingReviewsController],
    }).compile();

    controller = module.get<RatingReviewsController>(RatingReviewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
