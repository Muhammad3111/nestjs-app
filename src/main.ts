import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true, // 👈 bu bo‘lishi shart
      transformOptions: {
        enableImplicitConversion: true, // string → number avtomatik
      },
    }),
  );
  app.enableCors({
    origin: ['https://moneychange.uz', 'https://www.moneychange.uz'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
    credintial: true,
  });
  // Swagger Config
  const config = new DocumentBuilder()
    .setTitle('Exchange API')
    .setDescription(
      'NestJS backend for exchange application with regions, currencies, balances and orders management.',
    )
    .setVersion('1.0')
    .addBearerAuth() // JWT Auth uchun
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
