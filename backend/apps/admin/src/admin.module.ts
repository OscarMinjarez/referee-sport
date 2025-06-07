import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntitiesService } from '@app/entities';
import { StoreInfoModule } from './store-info/store-info.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: EntitiesService,
    }),
    StoreInfoModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
