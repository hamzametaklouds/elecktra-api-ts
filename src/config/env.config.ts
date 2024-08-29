/**
 * This module helps in organizing environment variables, and provides following advantages
 * Helps in renaming the variables
 * Helps in maping the varibles and seeing if missed some variables. This can be done with unit test cases.
 */
import { registerAs } from '@nestjs/config';
import { IDb, IServer, IRoot, ISendGridApiKey, ITwilioSid, ITwilioAuthToken, ITwilioPhoneNumber,IEmailFrom, IOtpExpiryInMinutes,IPlatformInvitationExpiryInDays, ICustomDomainBaseUrl, IS3SecretAccessKey, IS3AccessKeyId, IS3Region, IS3BucketName, IOtpEmailLinkBaseUrl, IOtpForgotPasswordBaseUrl, IJwtSecret, IOnboardingInvitationBaseUrl, IFirebase } from './env.config.interface';

export const db = registerAs(
  'db',
  (): IDb => ({
    connectionUrl: process.env.DB_URL,
  }),
);

export const server = registerAs(
  'server',
  (): IServer => ({
    port: parseInt(process.env.PORT),
    allowedClients: process.env.ALLOWED_CLIENTS?.split(','),
  }),
);

export const root = registerAs(
  'root',
  (): IRoot => ({
    env: process.env.NODE_ENV,
  }),
);

export const sendGridEmail = registerAs(
  'sendGridEmail',
  (): ISendGridApiKey => ({
    sendGridApiKey: process.env.SENDGRID_API_KEY,
  }),
);

export const twilioSid = registerAs(
  'twilioSid',
  (): ITwilioSid => ({
    twilioSid: process.env.TWILIO_SID,
  }),
);

export const twilioAuthToken = registerAs(
  'twilioAuthToken',
  (): ITwilioAuthToken => ({
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  }),
);

export const twilioPhoneNumber = registerAs(
  'twilioPhoneNumber',
  (): ITwilioPhoneNumber => ({
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
  }),
);

export const emailFrom = registerAs(
  'emailFrom',
  (): IEmailFrom => ({
    emailFrom: process.env.EMAIL_FROM,
  }),
);


export const otpExpiryInMinutes = registerAs(
  'otpExpiryInMinutes',
  (): IOtpExpiryInMinutes => ({
    otpExpiryInMinutes: process.env.OTP_EXPIRY_IN_MINUTES,
  }),
);

export const platformInvitationExpiryInDays = registerAs(
  'platformInvitationExpiryInDays',
  (): IPlatformInvitationExpiryInDays => ({
    platformInvitationExpiryInDays: process.env.PLATFORM_INVITATION_EXPIRY_IN_DAYS,
  }),

);

  export const customDomainBaseUrl = registerAs(
    'customDomainBaseUrl',
    (): ICustomDomainBaseUrl => ({
      customDomainBaseUrl: process.env.CUSTOM_DOMAIN_BASE_URL,
    }),
);

export const s3SecretAccessKey = registerAs(
  's3SecretAccessKey',
  (): IS3SecretAccessKey => ({
    s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  }),
);

export const s3AccessKeyId = registerAs(
  's3AccessKeyId',
  (): IS3AccessKeyId => ({
    s3AccessKeyId: process.env.S3_ACCESS_KEY_ID,
  }),
);

export const s3Region = registerAs(
  's3Region',
  (): IS3Region => ({
    s3Region: process.env.S3_REGION,
  }),
);

export const s3BucketName = registerAs(
  's3BucketName',
  (): IS3BucketName => ({
    s3BucketName: process.env.S3_BUCKET_NAME,
  }),
);

export const otpEmailLinkBaseUrl = registerAs(
  'otpEmailLinkBaseUrl',
  (): IOtpEmailLinkBaseUrl => ({
    otpEmailLinkBaseUrl: process.env.OTP_EMAIL_LINK_BASE_URL,
  }),
);

export const otpForgotPasswordBaseUrl = registerAs(
  'otpForgotPasswordBaseUrl',
  (): IOtpForgotPasswordBaseUrl => ({
    otpForgotPasswordBaseUrl: process.env.OTP_FORGOT_PASSWORD_BASE_URL,
  }),
);

export const jwtSecret = registerAs(
  'jwtSecret',
  (): IJwtSecret => ({
    jwtSecret: process.env.JWT_SECRET,
  }),
);

export const onboardingInvitationBaseUrl = registerAs(
  'onboardingInvitationBaseUrl',
  (): IOnboardingInvitationBaseUrl => ({
    onboardingInvitationBaseUrl: process.env.ONBOARDING_INVITATION_BASE_URL,
  }),
);

export const firebase = registerAs(
  'firebase',
  (): IFirebase => ({
    projectId: process.env.PROJECT_ID,
    privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.CLIENT_EMAIL,
  })
);