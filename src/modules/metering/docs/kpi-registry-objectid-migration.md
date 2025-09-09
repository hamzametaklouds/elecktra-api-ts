# KPI Registry Agent ID Migration to ObjectId

## Overview

The KPI registry schema has been updated to store `agent_id` as a MongoDB ObjectId instead of a string. This change improves data consistency and enables proper relationships between agents and their KPI registries.

## Changes Made

### 1. Schema Update

**File:** `src/modules/metering/schemas/kpi-registry.schema.ts`

```typescript
// Before
@Prop({ index: true }) agent_id: string;

// After
@Prop({ type: Types.ObjectId, ref: 'Agent', index: true }) agent_id: Types.ObjectId;
```

### 2. Service Updates

**File:** `src/modules/metering/services/kpi-registry.service.ts`

- Updated all methods to accept both `string` and `Types.ObjectId` for `agent_id`
- Added automatic conversion from string to ObjectId when needed
- Maintained backward compatibility with existing string inputs

### 3. Controller Updates

**File:** `src/modules/metering/controllers/kpi-management.controller.ts`

- Updated response mapping to convert ObjectId to string for API responses
- Ensured consistent string output in API responses

## Migration Process

### For Existing Data

If you have existing KPI registry data with string `agent_id` values, you need to run the migration script:

```bash
# Make sure you have a database backup first!
npx ts-node src/modules/metering/migrations/convert-kpi-registry-agent-id.ts
```

### Migration Script Features

- **Safety First**: Validates ObjectId format before conversion
- **Error Handling**: Skips invalid entries and logs warnings
- **Verification**: Confirms all conversions were successful
- **Logging**: Detailed progress and error reporting

## API Compatibility

The API remains fully compatible:

- **Input**: Still accepts string agent IDs in requests
- **Output**: Still returns string agent IDs in responses
- **Internal**: Converts to ObjectId for database operations

## Benefits

1. **Data Consistency**: Proper ObjectId references to Agent collection
2. **Performance**: Better indexing and query performance
3. **Relationships**: Enables proper MongoDB relationships
4. **Validation**: Built-in ObjectId validation
5. **Future-Proof**: Aligns with MongoDB best practices

## Testing

After migration, verify the changes:

```javascript
// Check that all agent_id fields are ObjectId type
db.agent_kpi_registry.find({ agent_id: { $type: "objectId" } }).count();

// Verify no string agent_id fields remain
db.agent_kpi_registry.find({ agent_id: { $type: "string" } }).count();
```

## Rollback Plan

If you need to rollback:

1. **Database**: Restore from backup
2. **Code**: Revert to previous version of the schema and service files
3. **Redeploy**: Deploy the previous version

## Environment Variables

The migration script uses these environment variables:

- `MONGODB_URI`: MongoDB connection string (default: `mongodb://localhost:27017/electra`)
- `DB_NAME`: Database name (default: `electra`)

## Example Usage

### Creating a KPI (unchanged)

```typescript
// Still works with string agent_id
await kpiRegistryService.createCustomKpi({
  agent_id: "507f1f77bcf86cd799439011", // string
  kpi_name: "messages_sent",
});
```

### Getting Agent KPIs (unchanged)

```typescript
// Still works with string agent_id
const kpis = await kpiRegistryService.getAgentKpis("507f1f77bcf86cd799439011");
```

### API Response (unchanged)

```json
{
  "kpi_id": "1000",
  "agent_id": "507f1f77bcf86cd799439011",
  "kpi_key": "1000",
  "title": "messages_sent",
  "unit": "unit",
  "description": "",
  "created_at": "2025-01-04T20:00:00.000Z"
}
```

## Notes

- The change is backward compatible at the API level
- Existing code using string agent IDs will continue to work
- The migration script is safe and can be run multiple times
- Always backup your database before running migrations
