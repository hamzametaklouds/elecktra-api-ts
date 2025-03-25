import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  WebSocketServer, 
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dtos/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  namespace: '/chat',
  path: '/socket.io',
  pingInterval: 10000,
  pingTimeout: 15000,
  connectTimeout: 45000,
  allowUpgrades: true
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() 
  server: Server;
  
  private logger: Logger = new Logger('ChatGateway');

  constructor(private chatService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() companyId: string) {
    try {
      console.log('joinRoom',companyId);
      client.join(`company-${companyId}`);
      this.logger.log(`Client ${client.id} joined room: company-${companyId}`);
      return { success: true, message: 'Joined room successfully' };
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`);
      return { success: false, message: 'Failed to join room' };
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket, 
    @MessageBody() data: CreateMessageDto & { 
      user: any,
      company_id: string,
      user_id: string 
    }
  ) {
    try {
      console.log('handleMessage', data);
      // Parse the data if it's a string
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      
      const messageDto = {
        content: parsedData.content,
        user_mentions: parsedData.user_mentions,
        agent_mentions: parsedData.agent_mentions,
        company_id: parsedData.company_id,
        userId: parsedData.user_id
      };

      console.log('messageDto', messageDto);
      const message = await this.chatService.createMessageSocket(messageDto);
      this.server.to(`company-${parsedData.company_id}`).emit('newMessage', message);
      return { success: true, data: message };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      return { success: false, message: 'Failed to send message' };
    }
  }

  @SubscribeMessage('editMessage')
  async handleEditMessage(
    @ConnectedSocket() client: Socket, 
    @MessageBody() data: { messageId: string; content: string; user: any }
  ) {
    try {
      const message = await this.chatService.editMessage(data.messageId, data.content, data.user);
      this.server.to(`company-${data.user.company_id}`).emit('messageUpdated', message);
      return { success: true, data: message };
    } catch (error) {
      this.logger.error(`Error editing message: ${error.message}`);
      return { success: false, message: 'Failed to edit message' };
    }
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket, 
    @MessageBody() data: { messageId: string; user: any }
  ) {
    try {
      const message = await this.chatService.deleteMessage(data.messageId, data.user);
      this.server.to(`company-${data.user.company_id}`).emit('messageDeleted', message);
      return { success: true, data: message };
    } catch (error) {
      this.logger.error(`Error deleting message: ${error.message}`);
      return { success: false, message: 'Failed to delete message' };
    }
  }
} 