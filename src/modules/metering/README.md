# Metering Module API Documentation

This module handles agent execution monitoring, KPI tracking, and usage billing.

## Base URL

`/v1`

## Authentication

All endpoints require proper headers for security validation.

## Endpoints

### 1. Agent Events Webhook

**POST** `/agent-events`

Handles execution events from agents (execution started/completed, KPI recordings, etc.)

#### Headers Required:

- `X-Agent-Id`: Agent identifier
- `X-Timestamp`: Request timestamp (ISO format)
- `X-Idempotency-Key`: Unique key to prevent duplicate processing
- `X-Signature`: HMAC signature (if webhook secret configured)

#### Request Body Examples:

**Execution Started:**

```json
{
  "event_type": "execution.started",
  "execution_id": "exec_123",
  "agent_id": "ag_123"
}
```

**Execution Completed:**

```json
{
  "event_type": "execution.completed",
  "execution_id": "exec_123",
  "agent_id": "ag_123",
  "duration_ms": 93000
}
```

**Custom KPI Recording:**

```json
{
  "event_type": "job.completed",
  "execution_id": "exec_123",
  "agent_id": "ag_123",
  "kpi_key": "messages_sent",
  "value": 42,
  "unit": "count"
}
```

**Token Usage:**

```json
{
  "event_type": "job.completed",
  "execution_id": "exec_123",
  "agent_id": "ag_123",
  "tokens_in": 150,
  "tokens_out": 75,
  "duration_ms": 45000
}
```

#### Response:

```json
{
  "status": "ok",
  "pricing_version": "v1",
  "trace_id": "ag_123-1757000286000",
  "processing_time_ms": 45
}
```

### 2. Custom KPI Management

#### Create Custom KPI

**POST** `/kpi/create`

Creates a new custom KPI for an agent.

**Request Body:**

```json
{
  "agent_id": "ag_123",
  "kpi_name": "messages_sent",
  "title": "Messages Sent",
  "unit": "count",
  "description": "Total number of messages sent by the agent"
}
```

**Response:**

```json
{
  "kpi_id": "messages_sent",
  "agent_id": "ag_123",
  "kpi_key": "messages_sent",
  "title": "Messages Sent",
  "unit": "count",
  "description": "Total number of messages sent by the agent",
  "created_at": "2025-01-04T20:00:00.000Z"
}
```

#### Get Agent KPIs

**GET** `/kpi/agent/:agentId`

Retrieves all KPIs for a specific agent.

**Response:**

```json
[
  {
    "kpi_id": "messages_sent",
    "agent_id": "ag_123",
    "kpi_key": "messages_sent",
    "title": "Messages Sent",
    "unit": "count",
    "description": "Total number of messages sent by the agent",
    "created_at": "2025-01-04T20:00:00.000Z"
  }
]
```

#### Get All KPIs

**GET** `/kpi/list`

Retrieves all KPIs across all agents.

## Event Types

### General Execution Events:

- `execution.started` - Agent execution begins
- `execution.completed` - Agent execution ends

### Custom KPI Events:

- `job.started` - Job/workflow starts (with KPI tracking)
- `job.completed` - Job/workflow completes (with KPI values)

### Resource Usage Events:

- `tool.used` - Tool usage (not billed)
- `kpi.recorded` - Custom KPI value recording

## KPI Schema

### Creating Custom KPIs:

```json
{
  "agent_id": "xxxx",
  "kpi_name": "xxxx"
}
```

**Output:** KPI ID (same as kpi_name)

### KPI Event Recording:

```json
{
  "event_type": "job.completed",
  "agent_id": "ag_123",
  "kpi_key": "1231",
  "value": 1
}
```

## Security Features

1. **Timestamp Validation**: Prevents replay attacks (5-minute window)
2. **Idempotency Keys**: Prevents duplicate event processing
3. **Signature Validation**: HMAC verification if webhook secret configured
4. **Agent Validation**: Ensures agent exists and is active

## Usage Monitoring

The system automatically tracks:

- Execution duration
- Token consumption (input/output)
- RAM usage
- Custom KPI values
- Tool usage

## Billing Integration

All events are processed for billing calculations based on:

- Runtime minutes
- Token consumption
- Custom KPI usage
- Resource utilization

## Incomplete Jobs Processing

The system automatically handles jobs that start but never complete by assigning them average scores based on historical data.

### Features:

- **Automatic Processing**: Runs every 30 minutes to find and process incomplete jobs
- **Average Calculation**: Uses historical data from the last 30 days to calculate average values
- **Default Values**: Provides sensible defaults when no historical data exists
- **Manual Trigger**: API endpoint to manually process incomplete jobs
- **Configurable**: Environment variables to customize timeout and processing behavior

### API Endpoints:

- `POST /v1/incomplete-jobs/process` - Manually trigger processing
- `GET /v1/incomplete-jobs/config` - Get configuration

### Configuration:

- `JOB_TIMEOUT_MINUTES` (default: 60) - Minutes after which a job is considered incomplete
- `INCOMPLETE_JOBS_AVERAGE_DAYS` (default: 30) - Days to look back for averages
- `INCOMPLETE_JOBS_AUTO_PROCESS` (default: true) - Enable/disable automatic processing

For detailed documentation, see [incomplete-jobs.md](./docs/incomplete-jobs.md).

## Error Handling

- **400**: Bad Request (validation failures, missing headers)
- **401**: Unauthorized (invalid signature)
- **404**: Agent not found
- **409**: KPI already exists
- **500**: Internal server error

## Integration Notes

- Use the same `execution_id` for start/completion events
- Include `idempotency_key` to prevent duplicate processing
- Set proper timestamps for accurate billing
- Monitor response status and trace_id for debugging
