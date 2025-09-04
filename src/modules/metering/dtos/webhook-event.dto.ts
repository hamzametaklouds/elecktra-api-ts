import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class WebhookEventDto {
  @ApiProperty({
    description: 'Type of event (e.g., job.completed, kpi.recorded)',
    example: 'job.completed'
  })
  @IsString()
  event_type: string;

  @ApiProperty({
    description: 'Agent ID that generated this event (optional if provided in X-Agent-Id header)',
    example: 'ag_123',
    required: false
  })
  @IsOptional()
  @IsString()
  agent_id?: string;

  @ApiProperty({
    description: 'Unique execution ID for this job/run',
    example: 'exec_1'
  })
  @IsString()
  execution_id: string;

  @ApiProperty({
    description: 'Duration in milliseconds (for job.completed events)',
    example: 93000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  duration_ms?: number;

  @ApiProperty({
    description: 'KPI key (for kpi.recorded events)',
    example: 'messages_sent',
    required: false
  })
  @IsOptional()
  @IsString()
  kpi_key?: string;

  @ApiProperty({
    description: 'KPI value (for kpi.recorded events)',
    example: 42,
    required: false
  })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiProperty({
    description: 'Unit for the KPI value',
    example: 'count',
    required: false
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    description: 'Tool key (for tool.used events - not billed)',
    example: 'gmail',
    required: false
  })
  @IsOptional()
  @IsString()
  tool_key?: string;

  @ApiProperty({
    description: 'RAM usage in GB',
    example: 2.5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  ram_gb?: number;

  @ApiProperty({
    description: 'Input tokens consumed',
    example: 150,
    required: false
  })
  @IsOptional()
  @IsNumber()
  tokens_in?: number;

  @ApiProperty({
    description: 'Output tokens generated',
    example: 75,
    required: false
  })
  @IsOptional()
  @IsNumber()
  tokens_out?: number;

  @ApiProperty({
    description: 'Metrics object containing token information',
    required: false
  })
  @IsOptional()
  @IsObject()
  metrics?: {
    tokens_in?: number;
    tokens_out?: number;
  };

  @ApiProperty({
    description: 'Additional metadata',
    required: false
  })
  @IsOptional()
  @IsObject()
  meta?: any;

  @ApiProperty({
    description: 'Idempotency key to prevent duplicate processing',
    example: 'idem_123',
    required: false
  })
  @IsOptional()
  @IsString()
  idempotency_key?: string;
}
