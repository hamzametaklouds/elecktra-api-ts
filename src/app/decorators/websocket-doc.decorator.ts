import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';

export const WebsocketDoc = (summary: string, bodySchema?: any) => {
  const decorators = [
    ApiOperation({ summary: `[WebSocket] ${summary}` }),
  ];

  if (bodySchema) {
    decorators.push(ApiBody({ type: bodySchema }));
  }

  return applyDecorators(...decorators);
}; 