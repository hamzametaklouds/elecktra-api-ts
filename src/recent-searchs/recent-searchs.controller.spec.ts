import { Test, TestingModule } from '@nestjs/testing';
import { RecentSearchsController } from './recent-searchs.controller';

describe('RecentSearchsController', () => {
  let controller: RecentSearchsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecentSearchsController],
    }).compile();

    controller = module.get<RecentSearchsController>(RecentSearchsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
