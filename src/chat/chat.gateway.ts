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
    origin: true, // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
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
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() company) {
    try {
      // If company is a string, parse it, otherwise use it as is
      const parsedData = typeof company === 'string' ? JSON.parse(company) : company;
      console.log('joinRoom', parsedData);
      
      // Access the company ID from the parsed data
      const companyId = parsedData.data;
      
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
    @MessageBody() data
  ) {
    try {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      
      this.logger.log(`Received message from client ${client.id} with data:`, parsedData);
      
      const messageDto = {
        content: parsedData.content,
        user_mentions: parsedData.user_mentions,
        agent_mentions: parsedData.agent_mentions,
        company_id: parsedData.company_id,
        userId: parsedData.user_id
      };

      this.logger.log(`Processing message with DTO:`, messageDto);
      
      const result = await this.chatService.createMessageSocket(messageDto);
      this.logger.log(`Message created successfully:`, result);
      
      const roomName = `company-${parsedData.company_id}`;
      this.logger.log(`Emitting message to room: ${roomName}`);
      
      // Check if client is in the room
      const rooms = Array.from(client.rooms);
      this.logger.log(`Client ${client.id} is in rooms:`, rooms);
      
      // Emit user message
      await this.server.to(roomName).emit('newMessage', result.userMessage);
      this.logger.log(`User message emitted to room ${roomName}`);
      
      // Emit agent responses if any
      for (const agentResponse of result.agentResponses) {
        await this.server.to(roomName).emit('newMessage', agentResponse);
        this.logger.log(`Agent response emitted to room ${roomName}`);
      }
      
      return { success: true, data: result };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`, error.stack);
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