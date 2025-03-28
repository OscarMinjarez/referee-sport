import { Module } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: EntitiesService
    })
  ],
  providers: [EntitiesService],
  exports: [EntitiesService],
})
export class EntitiesModule {}
