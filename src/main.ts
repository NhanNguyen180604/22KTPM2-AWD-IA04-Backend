import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  app.use(cookieParser(config.get<string>("cookie.secret")));

  app.enableCors();
  const port = config.get<number>("port") || 8001;
  await app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}
bootstrap();
