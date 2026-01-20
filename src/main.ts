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
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:4200',
        'https://moneychange.uz',
        'https://www.moneychange.uz',
      ];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
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
