import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { db, root, server, sendGridEmail, jwtSecret, s3SecretAccessKey, s3AccessKeyId, s3BucketName, s3Region } from './config/env.config';
import { googleOAuth } from './config/env.config/google-oauth.config';
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
import { DeliveredAgentsModule } from './delivered-agents/delivered-agents.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { NotificationsModule } from './notifications/notifications.module';
import { NotificationSettingsModule } from './notification-settings/notification-settings.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { TagsModule } from './tags/tags.module';
import { MeteringModule } from './modules/metering/metering.module';

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
        sentry,
        googleOAuth
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
    DeliveredAgentsModule,
    FileUploadModule,
    NotificationsModule,
    NotificationSettingsModule,
    DashboardModule,
    TagsModule,
    MeteringModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
