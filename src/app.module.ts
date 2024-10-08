import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { db, root, server, sendGridEmail, twilioAuthToken, twilioSid, twilioPhoneNumber, emailFrom, otpExpiryInMinutes, platformInvitationExpiryInDays, customDomainBaseUrl, s3AccessKeyId, s3SecretAccessKey, s3Region, s3BucketName, otpEmailLinkBaseUrl, otpForgotPasswordBaseUrl, jwtSecret, onboardingInvitationBaseUrl, firebase } from './config/env.config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { SystemUsersModule } from './system-users/system-users.module';
import { UsersModule } from './users/users.module';
import { ScreenConfigsModule } from './screen-configs/screen-configs.module';
import { HotelAndCarsModule } from './hotel-and-cars/hotel-and-cars.module';
import { DestinationsModule } from './destinations/destinations.module';
import { BookingsModule } from './bookings/bookings.module';
import { OptionsModule } from './options/options.module';
import { WhishlistModule } from './whishlist/whishlist.module';
import { RecentSearchsModule } from './recent-searchs/recent-searchs.module';




@Module({
  imports: [
    ConfigModule.forRoot({
      load:
        [
          root,
          db,
          server,
          sendGridEmail,
          twilioAuthToken,
          twilioSid,
          twilioPhoneNumber,
          emailFrom,
          otpExpiryInMinutes,
          platformInvitationExpiryInDays,
          customDomainBaseUrl,
          s3SecretAccessKey,
          s3AccessKeyId,
          s3Region,
          s3BucketName,
          otpEmailLinkBaseUrl,
          otpForgotPasswordBaseUrl,
          jwtSecret,
          onboardingInvitationBaseUrl,
          firebase
        ],
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    FileUploadModule,
    SystemUsersModule,
    UsersModule,
    ScreenConfigsModule,
    HotelAndCarsModule,
    DestinationsModule,
    BookingsModule,
    OptionsModule,
    WhishlistModule,
    RecentSearchsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
