import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error', 'debug', 'verbose'], // Add more log levels
  });

  const config = new DocumentBuilder()
    .setTitle('Projet Web Api example')
    .setDescription('The Projet Web API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidUnknownValues: true ,transform:true}),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
