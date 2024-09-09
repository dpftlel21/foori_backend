import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('=>(main.ts:8) process.env.PORT', process.env.PORT);
  await app.listen(process.env.PORT || 3001);
}
bootstrap().then((r) => console.log('NestJS Server Start'));
