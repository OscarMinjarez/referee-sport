import { Test, TestingModule } from '@nestjs/testing';
import { StoreInfoService } from './store-info.service';

describe('StoreInfoService', () => {
  let service: StoreInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreInfoService],
    }).compile();

    service = module.get<StoreInfoService>(StoreInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
