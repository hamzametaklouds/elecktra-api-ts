# Incomplete Jobs Processing

This document describes the incomplete jobs processing functionality that automatically handles jobs that start but never complete by assigning them average scores based on historical data.

## Overview

The incomplete jobs processing system addresses the issue where jobs are started (via `job.started` events) but never completed (no corresponding `job.completed` event). This can happen due to:

- Network timeouts
- Agent crashes
- System failures
- Long-running jobs that exceed expected timeouts

## How It Works

### 1. Automatic Processing

The system runs a scheduled task every 30 minutes that:

1. **Identifies Incomplete Jobs**: Finds all `job.started` events older than the configured timeout period (default: 60 minutes)
2. **Checks for Completion**: Verifies if a corresponding `job.completed` event exists
3. **Calculates Average Values**: For incomplete jobs, calculates the average value from completed jobs of the same KPI for the same agent over the last 30 days
4. **Creates Completion Events**: Generates `job.completed` events with the calculated average values
5. **Updates Billing**: Updates daily usage totals with the average values

### 2. Average Value Calculation

The system calculates average values using the following logic:

1. **Historical Data**: Looks at completed jobs for the same agent and KPI over the configured period (default: 30 days)
2. **Default Values**: If no historical data exists, uses predefined default values based on KPI type
3. **Rounding**: Rounds calculated averages to 2 decimal places

### 3. Default Values

When no historical data is available, the system uses these default values:

```typescript
{
  'messages_sent': 1,
  'emails_processed': 1,
  'documents_analyzed': 1,
  'api_calls': 1,
  'data_points': 1,
  'tasks_completed': 1,
  'queries_processed': 1,
  'reports_generated': 1,
  'files_processed': 1,
  'records_updated': 1,
  'notifications_sent': 1,
  'searches_performed': 1,
  'analyses_completed': 1,
  'recommendations_generated': 1,
  'validations_performed': 1
}
```

## Configuration

### Environment Variables

| Variable                       | Default            | Description                                                      |
| ------------------------------ | ------------------ | ---------------------------------------------------------------- |
| `JOB_TIMEOUT_MINUTES`          | `60`               | Minutes after which a job is considered incomplete               |
| `INCOMPLETE_JOBS_CRON`         | `EVERY_30_MINUTES` | Cron schedule for processing (not used, hardcoded to 30 minutes) |
| `INCOMPLETE_JOBS_AVERAGE_DAYS` | `30`               | Days to look back for calculating averages                       |
| `INCOMPLETE_JOBS_AUTO_PROCESS` | `true`             | Enable/disable automatic processing                              |

### Example Configuration

```bash
# Set job timeout to 2 hours
JOB_TIMEOUT_MINUTES=120

# Look back 7 days for averages
INCOMPLETE_JOBS_AVERAGE_DAYS=7

# Disable automatic processing
INCOMPLETE_JOBS_AUTO_PROCESS=false
```

## API Endpoints

### 1. Manual Processing

**POST** `/v1/incomplete-jobs/process`

Manually trigger processing of incomplete jobs.

**Response:**

```json
{
  "status": "success",
  "message": "Incomplete jobs processing completed",
  "processed": 5,
  "errors": 0,
  "timestamp": "2025-01-04T20:00:00.000Z"
}
```

### 2. Configuration

**GET** `/v1/incomplete-jobs/config`

Get current configuration for incomplete jobs processing.

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

## Event Structure

### Job Started Event

```json
{
  "event_type": "job.started",
  "agent_id": "ag_123",
  "kpi_key": 1231,
  "value": 1
}
```

### Generated Job Completed Event

```json
{
  "event_type": "job.completed",
  "agent_id": "ag_123",
  "kpi_key": 1231,
  "value": 2.5,
  "unit": "count",
  "metadata": {
    "incomplete_job_processed": true,
    "original_start_time": "2025-01-04T19:00:00.000Z",
    "processing_reason": "timeout_with_average_value",
    "calculated_average": 2.5
  },
  "idempotency_key": "incomplete_exec_123_1231_1757000286000"
}
```

## Monitoring and Logging

The system provides comprehensive logging for:

- **Processing Start/End**: When the scheduled task runs
- **Job Processing**: Individual job processing with calculated values
- **Errors**: Any errors encountered during processing
- **Statistics**: Number of jobs processed and any errors

### Log Examples

```
[IncompleteJobsService] Starting incomplete jobs processing...
[IncompleteJobsService] Found 3 potentially incomplete jobs
[IncompleteJobsService] Calculated average value 2.5 for agent ag_123, kpi 1231 from 10 completed jobs
[IncompleteJobsService] Processed incomplete job for agent ag_123, kpi 1231 with average value 2.5
[IncompleteJobsService] Completed processing 3 incomplete jobs
```

## Billing Impact

The incomplete jobs processing affects billing by:

1. **Adding KPI Values**: Incomplete jobs contribute their calculated average values to daily usage totals
2. **Accurate Billing**: Ensures that started jobs are billed even if they don't complete normally
3. **Fair Pricing**: Uses historical averages to provide reasonable billing amounts

## Best Practices

1. **Monitor Processing**: Regularly check logs to ensure the system is working correctly
2. **Adjust Timeouts**: Set appropriate timeout values based on your job characteristics
3. **Review Defaults**: Customize default values for your specific KPI types
4. **Manual Processing**: Use manual processing for testing or immediate cleanup
5. **Historical Data**: Ensure sufficient historical data exists for accurate averages

## Troubleshooting

### Common Issues

1. **No Historical Data**: If no completed jobs exist, the system uses default values
2. **Processing Errors**: Check logs for specific error messages
3. **Configuration Issues**: Verify environment variables are set correctly

### Debugging

1. **Check Configuration**: Use the `/config` endpoint to verify settings
2. **Manual Processing**: Trigger manual processing to test functionality
3. **Review Logs**: Check application logs for detailed processing information
4. **Database Queries**: Query the `usage_events` collection to see generated events

## Security Considerations

- **Idempotency**: All generated events include unique idempotency keys
- **Validation**: Events are validated before processing
- **Audit Trail**: All processing is logged with timestamps and details
- **Metadata**: Generated events include metadata explaining the processing reason
