import { Controller, Post, Body, Headers, HttpException, HttpStatus, UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { EventHandlerService } from '../services/event-handler.service';
import { SecurityService } from '../services/security.service';
import { WebhookEventDto } from '../dtos/webhook-event.dto';
import { AgentValidationService } from '../services/agent-validation.service';

@Controller('v1/agent-events')
export class AgentEventsController {
  private readonly logger = new Logger(AgentEventsController.name);

  constructor(
    private readonly handler: EventHandlerService,
    private readonly security: SecurityService,
    private readonly agentValidation: AgentValidationService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async handleWebhook(@Body() body: WebhookEventDto, @Headers() headers: any) {
    const startTime = Date.now();
    let trace_id: string;

    try {
      // Extract and validate required headers
      const agentId = this.security.extractAgentId(headers);
      const timestamp = this.security.extractTimestamp(headers);
      const idempotencyKey = this.security.extractIdempotencyKey(headers);
      const signature = headers['x-signature'];

      // Generate trace ID for logging and tracking
      trace_id = `${agentId || 'unknown'}-${Date.now()}`;
      this.logger.log(`Processing webhook event: ${trace_id}`, { agentId, eventType: body.event_type });

      // Validate required headers
      if (!agentId) {
        throw new HttpException('Missing X-Agent-Id header', HttpStatus.BAD_REQUEST);
      }

      if (!timestamp) {
        throw new HttpException('Missing X-Timestamp header', HttpStatus.BAD_REQUEST);
      }

      if (!idempotencyKey) {
        throw new HttpException('Missing X-Idempotency-Key header', HttpStatus.BAD_REQUEST);
      }

      // Validate request body
      if (!body.event_type) {
        throw new HttpException('Missing event_type in body', HttpStatus.BAD_REQUEST);
      }

      if (!body.execution_id) {
        throw new HttpException('Missing execution_id in body', HttpStatus.BAD_REQUEST);
      }

      // Use agent_id from body if not in headers (for backward compatibility)
      const finalAgentId = agentId || body.agent_id;
      if (!finalAgentId) {
        throw new HttpException('Missing agent_id in headers or body', HttpStatus.BAD_REQUEST);
      }

      // Validate timestamp (prevent replay attacks)
      const requestTime = new Date(timestamp).getTime();
      const currentTime = Date.now();
      const timeDiff = Math.abs(currentTime - requestTime);
      const maxTimeDiff = 5 * 60 * 1000; // 5 minutes

      if (timeDiff > maxTimeDiff) {
        throw new HttpException('Request timestamp is too old or too far in the future', HttpStatus.BAD_REQUEST);
      }

      // Validate that the agent exists and is active
      const agentValidation = await this.agentValidation.validateAgent(finalAgentId);
      if (!agentValidation.isValid) {
        this.logger.warn(`Agent validation failed: ${agentValidation.reason}`, { agentId, trace_id });
        throw new HttpException(
          `Agent validation failed: ${agentValidation.reason}`, 
          HttpStatus.BAD_REQUEST
        );
      }

      // Validate webhook signature if secret is configured
      const webhookSecret = process.env.WEBHOOK_SECRET;
      if (webhookSecret && signature) {
        const isValidSignature = this.security.validateSignature(
          JSON.stringify(body),
          signature,
          webhookSecret
        );
        
        if (!isValidSignature) {
          this.logger.warn('Invalid webhook signature', { agentId, trace_id });
          throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
        }
      } else if (webhookSecret && !signature) {
        this.logger.warn('Webhook secret configured but no signature provided', { agentId, trace_id });
        throw new HttpException('Signature required', HttpStatus.UNAUTHORIZED);
      }

      // Process the event
      this.logger.log(`Processing event: ${body.event_type}`, { 
        agentId: finalAgentId, 
        executionId: body.execution_id, 
        trace_id 
      });

      const applied = await this.handler.handle(body, trace_id);
      
      const processingTime = Date.now() - startTime;
      this.logger.log(`Webhook processed successfully`, { 
        agentId, 
        trace_id, 
        processingTime,
        pricingVersion: applied?.version 
      });

      return { 
        status: 'ok', 
        pricing_version: applied?.version,
        trace_id,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      if (error instanceof HttpException) {
        this.logger.warn(`Webhook validation failed`, { 
          trace_id, 
          status: error.getStatus(),
          message: error.message,
          processingTime 
        });
        throw error;
      }

      this.logger.error(`Webhook processing error`, { 
        trace_id, 
        error: error.message,
        stack: error.stack,
        processingTime 
      });

      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
