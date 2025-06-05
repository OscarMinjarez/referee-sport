import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { ProductsModule } from './products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntitiesService } from '@app/entities';
import { StaticModule } from './static/static.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: EntitiesService
    }),
    ProductsModule,
    StaticModule
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
