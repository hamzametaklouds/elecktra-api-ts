import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { db, root, server, sendGridEmail, jwtSecret } from './config/env.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { sentry } from './config/env.config/sentry.config';
import { InvitationsModule } from './invitations/invitations.module';
import { CompanyModule } from './company/company.module';
import { AgentsModule } from './agents/agents.module';
import { IntegrationsModule } from './integrations/integrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        root,
        db,
        server,
        sendGridEmail,
        jwtSecret,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
