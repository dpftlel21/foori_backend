import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT);
}
bootstrap().then((r) =>
  console.log(`NestJS Fcm Server Start PORT : ${process.env.PORT}`),
);
