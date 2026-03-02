import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: false,
  });
  app.use(morgan('dev'));
  const PORT = process.env.PORT || 5000;
  await app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started at port ${PORT}`);
  });
}
bootstrap();
