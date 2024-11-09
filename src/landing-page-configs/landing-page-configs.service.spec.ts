import { Test, TestingModule } from '@nestjs/testing';
import { LandingPageConfigsService } from './landing-page-configs.service';

describe('LandingPageConfigsService', () => {
  let service: LandingPageConfigsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LandingPageConfigsService],
    }).compile();

    service = module.get<LandingPageConfigsService>(LandingPageConfigsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
