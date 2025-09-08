# Incomplete Jobs Processing Example

This example demonstrates how the incomplete jobs processing system works in practice.

## Scenario

An agent starts a job to process emails but the job never completes due to a network timeout. The system will automatically detect this incomplete job and assign it an average score based on historical data.

## Step-by-Step Process

### 1. Job Started Event

When the agent starts processing emails, it sends a `job.started` event:

```json
POST /v1/agent-events
Headers:
  X-Agent-Id: ag_email_processor_123
  X-Timestamp: 2025-01-04T19:00:00.000Z
  X-Idempotency-Key: job_start_001

Body:
{
  "event_type": "job.started",
  "agent_id": "ag_email_processor_123",
  "kpi_key": 1231,
  "value": 1
}
```

**Response:**

```json
{
  "status": "ok",
  "pricing_version": "v1",
  "trace_id": "ag_email_processor_123-1757000286000",
  "processing_time_ms": 45
}
```

### 2. Job Never Completes

Due to a network timeout or system failure, the agent never sends a `job.completed` event. The job remains incomplete.

### 3. Automatic Processing (After 60 minutes)

The incomplete jobs service runs every 30 minutes and detects the incomplete job:

```
[IncompleteJobsService] Starting incomplete jobs processing...
[IncompleteJobsService] Found 1 potentially incomplete jobs
[IncompleteJobsService] Calculated average value 3.2 for agent ag_email_processor_123, kpi 1231 from 15 completed jobs
[IncompleteJobsService] Processed incomplete job for agent ag_email_processor_123, kpi 1231 with average value 3.2
[IncompleteJobsService] Completed processing 1 incomplete jobs
```

### 4. Generated Completion Event

The system automatically creates a `job.completed` event with the calculated average value:

```json
{
  "ts": "2025-01-04T20:30:00.000Z",
  "agent_id": "ag_email_processor_123",
  "execution_id": "exec_001",
  "event_type": "job.completed",
  "kpi_key": "1231",
  "value": 3.2,
  "unit": "count",
  "metadata": {
    "incomplete_job_processed": true,
    "original_start_time": "2025-01-04T19:00:00.000Z",
    "processing_reason": "timeout_with_average_value",
    "calculated_average": 3.2
  },
  "idempotency_key": "incomplete_exec_001_1231_1757000286000"
}
```

### 5. Billing Impact

The daily usage totals are updated with the average value:

```json
{
  "agent_id": "ag_email_processor_123",
  "date": "2025-01-04",
  "totals": {
    "runtime_minutes": 0,
    "kpis": {
      "1231": 3.2
    }
  }
}
```

## Manual Processing Example

You can also manually trigger processing of incomplete jobs:

```bash
curl -X POST http://localhost:3000/v1/incomplete-jobs/process
```

**Response:**

```json
{
  "status": "success",
  "message": "Incomplete jobs processing completed",
  "processed": 1,
  "errors": 0,
  "timestamp": "2025-01-04T20:30:00.000Z"
}
```

## Configuration Example

Check the current configuration:

```bash
curl http://localhost:3000/v1/incomplete-jobs/config
```

**Response:**

```json
{
  "job_timeout_minutes": 60,
  "cron_schedule": "EVERY_30_MINUTES",
  "average_calculation_days": 30,
  "enable_automatic_processing": true,
  "description": "Configuration for incomplete jobs processing",
  "default_values": {
    "messages_sent": 1,
    "emails_processed": 1,
    "documents_analyzed": 1,
    "api_calls": 1,
    "data_points": 1,
    "tasks_completed": 1,
    "queries_processed": 1,
    "reports_generated": 1
  }
}
```

## Benefits

1. **Fair Billing**: Jobs that start but don't complete are still billed based on historical averages
2. **Automatic Recovery**: No manual intervention required for incomplete jobs
3. **Accurate Metrics**: KPI totals reflect actual work attempted, not just completed work
4. **Configurable**: Timeout periods and default values can be customized
5. **Audit Trail**: All processing is logged and tracked with metadata

## Edge Cases

### No Historical Data

If an agent has no completed jobs for a KPI, the system uses default values:

```json
{
  "value": 1,
  "metadata": {
    "processing_reason": "timeout_with_default_value",
    "default_value_used": true
  }
}
```

### Multiple Incomplete Jobs

The system processes all incomplete jobs in a single run:

```
[IncompleteJobsService] Found 5 potentially incomplete jobs
[IncompleteJobsService] Processed incomplete job for agent ag_001, kpi 1231 with average value 2.5
[IncompleteJobsService] Processed incomplete job for agent ag_002, kpi 1232 with average value 1.8
[IncompleteJobsService] Processed incomplete job for agent ag_003, kpi 1233 with average value 4.2
[IncompleteJobsService] Processed incomplete job for agent ag_004, kpi 1234 with average value 1.0
[IncompleteJobsService] Processed incomplete job for agent ag_005, kpi 1235 with average value 3.1
[IncompleteJobsService] Completed processing 5 incomplete jobs
```

This ensures that all incomplete jobs are handled consistently and fairly.
