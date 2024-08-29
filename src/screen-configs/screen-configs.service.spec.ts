import { Test, TestingModule } from '@nestjs/testing';
import { ScreenConfigsService } from './screen-configs.service';

describe('ScreenConfigsService', () => {
  let service: ScreenConfigsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScreenConfigsService],
    }).compile();

    service = module.get<ScreenConfigsService>(ScreenConfigsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
