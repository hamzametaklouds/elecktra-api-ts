import { registerAs } from '@nestjs/config';

export const sentry = registerAs('sentry', () => ({
  dsn: process.env.SENTRY_DSN,
})); 