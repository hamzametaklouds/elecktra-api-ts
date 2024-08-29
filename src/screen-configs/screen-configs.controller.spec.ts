import { Test, TestingModule } from '@nestjs/testing';
import { ScreenConfigsController } from './screen-configs.controller';

describe('ScreenConfigsController', () => {
  let controller: ScreenConfigsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScreenConfigsController],
    }).compile();

    controller = module.get<ScreenConfigsController>(ScreenConfigsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
