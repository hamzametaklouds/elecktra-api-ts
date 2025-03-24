import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { INestApplication, Logger } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable, from } from 'rxjs';
import { ConfigService } from '@nestjs/config';

export class WebSocketAdapter extends IoAdapter {
  private app: INestApplication;
  private readonly logger = new Logger('WebSocketAdapter');
  private readonly configService: ConfigService;

  constructor(app: INestApplication) {
    super(app);
    this.app = app;
    this.configService = app.get(ConfigService);
    this.logger.log('WebSocketAdapter constructor called');
  }

  createIOServer(port: number, options?: ServerOptions) {
    const wsPort = (this.configService.get('server.port') || 5200) + 1;
    
    const optionsWithCORS: ServerOptions = {
      ...options,
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'OPTIONS'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000,
    };
    
    this.logger.log(`Creating WebSocket server on port ${wsPort}`);
    const server = super.createIOServer(wsPort, optionsWithCORS);
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
