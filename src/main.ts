import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import admin from 'firebase-admin';
import { AppModule } from './app.module';
import { AuthorizationHeader, AuthorizationHeaderSchema } from './app/swagger.constant';
import { FirebaseServiceAccount } from './app/fire-base';
import { WebSocketAdapter } from './chat/websocket.adapter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log('Starting application bootstrap...');

  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const env = configService.get('root.env');
  const port = configService.get('server.port') || 5200;
  const wsPort = port;
  
  console.log('\n\n\n\nport', port);

  logger.log(`Application environment: ${env}`);
  logger.log(`Server port: ${port}`);

  // Enable CORS
  logger.log('Configuring CORS...');
  app.enableCors({
    origin: true, // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(new ValidationPipe());

  // Initialize WebSocket adapter
  logger.log('Initializing WebSocket adapter...');
  // const wsAdapter = new WebSocketAdapter(app);
  // app.useWebSocketAdapter(wsAdapter);

  logger.log('WebSocket adapter initialized');

  admin.initializeApp({
    credential: admin.credential.cert(FirebaseServiceAccount),
  });

  const config = new DocumentBuilder()
    .setTitle('electra-consumer-service API platform')
    .setDescription('electra-consumer-service platform APIs - Developer playground')
    .setVersion('1.0')
    .addTag('electra-consumer-service')
    .addBearerAuth(
      AuthorizationHeaderSchema,
      AuthorizationHeader
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Starting HTTP server
  logger.log('Starting HTTP server...');
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`WebSocket server is running on: ws://localhost:${wsPort}/chat`);
  logger.log('Application bootstrap completed');
}
bootstrap();
