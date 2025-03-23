import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { INestApplication, Logger } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable, from } from 'rxjs';

export class WebSocketAdapter extends IoAdapter {
  private app: INestApplication;
  private readonly logger = new Logger('WebSocketAdapter');

  constructor(app: INestApplication) {
    super(app);
    this.app = app;
    this.logger.log('WebSocketAdapter constructor called');
  }

  createIOServer(port: number, options?: ServerOptions) {
    const optionsWithCORS = {
      ...options,
      cors: {
        origin: '*', // Make sure this is allowed from Postman or your frontend
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket'],
      path: '/chat',  // Ensure this matches the path in the gateway
      connectTimeout: 45000,
      pingTimeout: 30000,
      pingInterval: 25000
    };
  
    const server = super.createIOServer(port, optionsWithCORS);
    server.on('connection', (socket) => {
      this.logger.log(`Client connected: ${socket.id}`);
    });
    
    return server;
  }
  

  // Implement bindClientConnect if needed
  bindClientConnect(server: any, callback: Function) {
    this.logger.log('Binding client connect event');
    server.on('connection', callback);
  }

  // Implement bindClientDisconnect if needed
  bindClientDisconnect(client: any, callback: Function) {
    this.logger.log('Binding client disconnect event');
    client.on('disconnect', callback);
  }

  // Implement close method
  async close() {
    this.logger.log('Closing WebSocket adapter');
    // Implementation of cleanup logic
    return Promise.resolve();
  }

  // Custom message handler binding function
  bindMessageHandlers(
    socket: any,
    handlers: MessageMappingProperties[],
    transform: (data: any) => Observable<any>,
  ): void {
    this.logger.log(`Binding message handlers for socket ${socket.id}`);
    const transformWithFallback = transform ?? ((data: any) => from([data]));
    super.bindMessageHandlers(socket, handlers, transformWithFallback);
  }
}
