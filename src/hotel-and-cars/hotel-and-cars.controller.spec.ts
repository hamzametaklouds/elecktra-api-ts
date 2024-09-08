import { Test, TestingModule } from '@nestjs/testing';
import { HotelAndCarsController } from './hotel-and-cars.controller';

describe('HotelAndCarsController', () => {
  let controller: HotelAndCarsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelAndCarsController],
    }).compile();

    controller = module.get<HotelAndCarsController>(HotelAndCarsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
