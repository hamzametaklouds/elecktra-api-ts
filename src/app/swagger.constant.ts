import { IAuthorizationHeaderSchema } from './interfaces';

export const AuthorizationHeaderSchema: IAuthorizationHeaderSchema = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  name: 'JWT',
  description: 'Enter JWT token',
  in: 'header',
};

export const AuthorizationHeader = 'JWT-auth';
