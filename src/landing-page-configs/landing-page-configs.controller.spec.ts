import { Test, TestingModule } from '@nestjs/testing';
import { LandingPageConfigsController } from './landing-page-configs.controller';

describe('LandingPageConfigsController', () => {
  let controller: LandingPageConfigsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LandingPageConfigsController],
    }).compile();

    controller = module.get<LandingPageConfigsController>(LandingPageConfigsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
