import { Test, TestingModule } from '@nestjs/testing';
import { RatingReviewsService } from './rating-reviews.service';

describe('RatingReviewsService', () => {
  let service: RatingReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RatingReviewsService],
    }).compile();

    service = module.get<RatingReviewsService>(RatingReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
