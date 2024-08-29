import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { AppModule } from './app.module';
import { AuthorizationHeader, AuthorizationHeaderSchema } from './app/swagger.constant';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const env = configService.get('root.env');
// const allowedClients = configService.get('server.allowedClients');
  const port = configService.get('server.port');
  const projectId = configService.get('firebase.projectId');
  const clientEmail = configService.get('firebase.clientEmail');
  const privateKey = configService.get('firebase.privateKey');

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());


    /**
   * setting up google credentials for fcm app
   */
    // admin.initializeApp({
    //   credential: admin.credential.cert({
    //     projectId: projectId,
    //     clientEmail: clientEmail,
    //     privateKey: privateKey,
    //   }),
    // });
  

  /**
   * Setting swagger ui document details
   */
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
