import { Module } from '@nestjs/common';
import { SizeController } from './size.controller';

@Module({
  controllers: [SizeController]
})
export class SizeModule {}
