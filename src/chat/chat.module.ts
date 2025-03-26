import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { UsersModule } from 'src/users/users.module';
import { CompanyModule } from 'src/company/company.module';
import { AgentRequestsModule } from 'src/agent-requests/agent-requests.module';
import { ChatModel } from './chat.model';
import { MessagesModel } from './messages.model';
import { ChatGateway } from './chat.gateway';
import { DeliveredAgentsModule } from 'src/delivered-agents/delivered-agents.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    forwardRef(() => UsersModule),
    forwardRef(() => CompanyModule),
    forwardRef(() => AgentRequestsModule),
    forwardRef(() => DeliveredAgentsModule),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    ...ChatModel,
    ...MessagesModel
  ],
  exports: [ChatService]
})
export class ChatModule {} 