import { NestFactory } from '@nestjs/core';
import { ClientsModule } from './clients.module';

async function bootstrap() {
  const app = await NestFactory.create(ClientsModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
