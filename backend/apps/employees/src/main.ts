import { NestFactory } from '@nestjs/core';
import { EmployeesModule } from './employees.module';

async function bootstrap() {
  const app = await NestFactory.create(EmployeesModule);
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: '*',
    methods: '*',
    credentials: false,
    allowedHeaders: '*'
  });
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
