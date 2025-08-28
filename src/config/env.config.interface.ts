export interface IAppEnv {
  env: string;
  db: {
    connectionUrl: string;
  };
  server: {
    port: number;
    allowedClients: string[];
  };
}

export interface IDb {
  connectionUrl: string;
}

export interface IRoot {
  env: String;
}

export interface IServer {
  port: number;
  allowedClients: string[];
}

export interface ISendGridApiKey {
  sendGridApiKey: String;
}

export interface ITwilioSid {
  twilioSid: String;
}

export interface ITwilioAuthToken {
  twilioAuthToken: String;
}

export interface ITwilioPhoneNumber {
  twilioPhoneNumber: String;
}

export interface IEmailFrom {
  emailFrom: String;
}

export interface IOtpExpiryInMinutes {
  otpExpiryInMinutes: String;
}

export interface IPlatformInvitationExpiryInDays {
  platformInvitationExpiryInDays: String;
}

export interface ICustomDomainBaseUrl {
  customDomainBaseUrl: String;
}

export interface IS3SecretAccessKey {
  s3SecretAccessKey: String;
}

export interface IS3AccessKeyId {
  s3AccessKeyId: String;
}

export interface IS3Region {
  s3Region: String;
}

export interface IS3BucketName {
  s3BucketName: String;
}

export interface IOtpEmailLinkBaseUrl {
  otpEmailLinkBaseUrl: String;
}

export interface IOtpForgotPasswordBaseUrl {
  otpForgotPasswordBaseUrl: String;
}

export interface IJwtSecret {
  jwtSecret: String;
}

export interface IOnboardingInvitationBaseUrl {
  onboardingInvitationBaseUrl: String;
}

export interface IFirebase {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

