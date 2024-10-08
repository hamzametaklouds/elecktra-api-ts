import { Test, TestingModule } from '@nestjs/testing';
import { RecentSearchsService } from './recent-searchs.service';

describe('RecentSearchsService', () => {
  let service: RecentSearchsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecentSearchsService],
    }).compile();

    service = module.get<RecentSearchsService>(RecentSearchsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
