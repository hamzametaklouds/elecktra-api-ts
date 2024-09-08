import { Test, TestingModule } from '@nestjs/testing';
import { HotelAndCarsService } from './hotel-and-cars.service';

describe('HotelAndCarsService', () => {
  let service: HotelAndCarsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HotelAndCarsService],
    }).compile();

    service = module.get<HotelAndCarsService>(HotelAndCarsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
