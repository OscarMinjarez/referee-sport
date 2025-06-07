import { Test, TestingModule } from '@nestjs/testing';
import { StoreInfoController } from './store-info.controller';

describe('StoreInfoController', () => {
  let controller: StoreInfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreInfoController],
    }).compile();

    controller = module.get<StoreInfoController>(StoreInfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
