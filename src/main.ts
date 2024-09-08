import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import admin from 'firebase-admin';
import { AppModule } from './app.module';
import { AuthorizationHeader, AuthorizationHeaderSchema } from './app/swagger.constant';
import { FirebaseServiceAccount } from './app/fire-base';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const env = configService.get('root.env');
  // const allowedClients = configService.get('server.allowedClients');
  const port = configService.get('server.port');


  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  admin.initializeApp({
    credential: admin.credential.cert(FirebaseServiceAccount),
  })




  const config = new DocumentBuilder()
    .setTitle('voyagevite-consumer-service API platform')
    .setDescription('voyagevite-consumer-service platform APIs - Developer playground')
    .setVersion('1.0')
    .addTag('voyagevite-consumer-service')
    .addBearerAuth(
      AuthorizationHeaderSchema,
      AuthorizationHeader // This name here is for matching up with @ApiBearerAuth() in controllers
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
}
bootstrap();
