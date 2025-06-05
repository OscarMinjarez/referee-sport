import { NestFactory } from '@nestjs/core';
import { ClientsModule } from './clients.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ClientsModule);
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: '*',
    methods: '*',
    credentials: false,
    allowedHeaders: '*'
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
