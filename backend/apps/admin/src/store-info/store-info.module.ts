import { Module } from '@nestjs/common';
import { StoreInfoService } from './store-info.service';
import { StoreInfoController } from './store-info.controller';

@Module({
  providers: [StoreInfoService],
  controllers: [StoreInfoController]
})
export class StoreInfoModule {}
