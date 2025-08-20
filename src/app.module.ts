import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { db, root, server, sendGridEmail, jwtSecret, s3SecretAccessKey, s3AccessKeyId, s3BucketName, s3Region } from './config/env.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { sentry } from './config/env.config/sentry.config';
import { InvitationsModule } from './invitations/invitations.module';
import { CompanyModule } from './company/company.module';
import { AgentsModule } from './agents/agents.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { ToolsModule } from './tools/tools.module';
import { AgentRequestsModule } from './agent-requests/agent-requests.module';
import { ChatModule } from './chat/chat.module';
import { DeliveredAgentsModule } from './delivered-agents/delivered-agents.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        root,
        db,
        server,
        sendGridEmail,
        jwtSecret,
        s3SecretAccessKey,
          s3AccessKeyId,
          s3Region,
          s3BucketName,
        sentry
      ],
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    InvitationsModule,
    CompanyModule,
    AgentsModule,
    IntegrationsModule,
    ToolsModule,
    AgentRequestsModule,
    AuthModule,
    ChatModule,
    DeliveredAgentsModule,
    FileUploadModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
