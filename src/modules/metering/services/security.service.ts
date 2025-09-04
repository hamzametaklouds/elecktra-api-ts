import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class SecurityService {
  /**
   * Validate webhook signature
   * @param payload Raw request body
   * @param signature Signature header value
   * @param secret Webhook secret
   * @returns boolean indicating if signature is valid
   */
  validateSignature(payload: string, signature: string, secret: string): boolean {
    if (!signature || !secret) return false;
    
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex')}`;
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Extract agent ID from headers
   * @param headers Request headers
   * @returns agent ID or null
   */
  extractAgentId(headers: any): string | null {
    return headers['x-agent-id'] || null;
  }

  /**
   * Extract timestamp from headers
   * @param headers Request headers
   * @returns timestamp or null
   */
  extractTimestamp(headers: any): string | null {
    return headers['x-timestamp'] || null;
  }

  /**
   * Extract idempotency key from headers
   * @param headers Request headers
   * @returns idempotency key or null
   */
  extractIdempotencyKey(headers: any): string | null {
    return headers['x-idempotency-key'] || null;
  }
}
