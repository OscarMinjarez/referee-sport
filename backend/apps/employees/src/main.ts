import { NestFactory } from '@nestjs/core';
import { EmployeesModule } from './employees.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(EmployeesModule);
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: '*',
    methods: '*',
    credentials: false,
    allowedHeaders: '*'
  });
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
