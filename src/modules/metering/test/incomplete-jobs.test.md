# Testing Incomplete Jobs Processing

## Manual Testing Steps

### 1. Start the Application

```bash
npm run start:dev
```

### 2. Create a Job Started Event

Send a job started event that will never complete:

```bash
curl -X POST http://localhost:3000/v1/agent-events \
  -H "Content-Type: application/json" \
  -H "X-Agent-Id: test_agent_123" \
  -H "X-Timestamp: $(date -u +%Y-%m-%dT%H:%M:%S.000Z)" \
  -H "X-Idempotency-Key: test_job_$(date +%s)" \
  -d '{
    "event_type": "job.started",
    "agent_id": "test_agent_123",
    "kpi_key": 1231,
    "value": 1
  }'
```

### 3. Wait for Timeout (or manually trigger)

Wait for the configured timeout period (default: 60 minutes) or manually trigger processing:

```bash
curl -X POST http://localhost:3000/v1/incomplete-jobs/process
```

### 4. Check Configuration

```bash
curl http://localhost:3000/v1/incomplete-jobs/config
```

### 5. Verify Processing

Check the application logs for processing messages:

```
[IncompleteJobsService] Starting incomplete jobs processing...
[IncompleteJobsService] Found X potentially incomplete jobs
[IncompleteJobsService] Processed incomplete job for agent test_agent_123, kpi 1231 with average value X.X
```

## Expected Results

1. **Job Started Event**: Should be accepted and stored
2. **Automatic Processing**: Should run every 30 minutes (if enabled)
3. **Manual Processing**: Should process incomplete jobs immediately
4. **Generated Events**: Should create job.completed events with average values
5. **Billing Updates**: Should update daily usage totals

## Configuration Testing

Test different configurations by setting environment variables:

```bash
# Test with 5-minute timeout
JOB_TIMEOUT_MINUTES=5 npm run start:dev

# Test with 7-day average calculation
INCOMPLETE_JOBS_AVERAGE_DAYS=7 npm run start:dev

# Test with automatic processing disabled
INCOMPLETE_JOBS_AUTO_PROCESS=false npm run start:dev
```

## Database Verification

Check the database to verify events are created correctly:

```javascript
// Check usage_events collection
db.usage_events.find({
  agent_id: "test_agent_123",
  event_type: "job.completed",
  "metadata.incomplete_job_processed": true,
});

// Check daily_agent_usage collection
db.daily_agent_usage.find({
  agent_id: "test_agent_123",
});
```

## Troubleshooting

### Common Issues

1. **No Processing**: Check if automatic processing is enabled
2. **No Average Values**: Ensure there are completed jobs for the same KPI
3. **Configuration Issues**: Verify environment variables are set correctly

### Debug Commands

```bash
# Check if the service is running
curl http://localhost:3000/v1/incomplete-jobs/config

# Manually trigger processing
curl -X POST http://localhost:3000/v1/incomplete-jobs/process

# Check application logs
tail -f logs/application.log | grep IncompleteJobsService
```
