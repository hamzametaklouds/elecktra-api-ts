import { Test, TestingModule } from '@nestjs/testing';
import { WhishlistController } from './whishlist.controller';

describe('WhishlistController', () => {
  let controller: WhishlistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhishlistController],
    }).compile();

    controller = module.get<WhishlistController>(WhishlistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
