# KPI Unit Handling Integration Test

This document describes the integration test scenarios for the KPI unit handling fix.

## Test Scenarios

### 1. Create KPI with Custom Unit

**Request:**

```bash
POST /api/v1/kpi/create
Content-Type: application/json

{
  "agent_id": "ag_123",
  "kpi_name": "App Opens",
  "unit": "events",
  "type": "image",
  "graph_type": "line"
}
```

**Expected Response:**

```json
{
  "kpi_id": "1000",
  "agent_id": "ag_123",
  "kpi_key": "1000",
  "title": "App Opens",
  "unit": "events",
  "description": "",
  "image": "https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI",
  "type": "image",
  "graph_type": "line",
  "created_at": "2025-01-04T20:00:00.000Z"
}
```

**Database Verification:**

- Check that the KPI is stored with `unit: "events"` (not "units")

### 2. Create KPI without Unit (Default)

**Request:**

```bash
POST /api/v1/kpi/create
Content-Type: application/json

{
  "agent_id": "ag_123",
  "kpi_name": "Messages Sent",
  "type": "image",
  "graph_type": "line"
}
```

**Expected Response:**

```json
{
  "kpi_id": "1001",
  "agent_id": "ag_123",
  "kpi_key": "1001",
  "title": "Messages Sent",
  "unit": "units",
  "description": "",
  "image": "https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI",
  "type": "image",
  "graph_type": "line",
  "created_at": "2025-01-04T20:00:00.000Z"
}
```

### 3. Update KPI Unit

**Request:**

```bash
PUT /api/v1/kpi/agent/ag_123/kpi/1000/unit
Content-Type: application/json

{
  "unit": "orders"
}
```

**Expected Response:**

```json
{
  "kpi_id": "1000",
  "agent_id": "ag_123",
  "kpi_key": "1000",
  "title": "App Opens",
  "unit": "orders",
  "description": "",
  "image": "https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI",
  "type": "image",
  "graph_type": "line",
  "created_at": "2025-01-04T20:00:00.000Z"
}
```

### 4. Get KPI Graph Data with Unit

**Request:**

```bash
GET /api/v1/kpi/agent/ag_123/kpi/1000/graph-data
```

**Expected Response:**

```json
{
  "agent_id": "ag_123",
  "kpi_key": "1000",
  "unit": "orders",
  "data_points": [
    {
      "x": "2025-01-04T10:00:00.000Z",
      "y": 42,
      "label": "Morning Peak"
    }
  ],
  "created_at": "2025-01-04T20:00:00.000Z",
  "updated_at": "2025-01-04T20:00:00.000Z"
}
```

### 5. Add KPI Graph Data Point

**Request:**

```bash
POST /api/v1/kpi/agent/ag_123/kpi/1000/graph-data
Content-Type: application/json

{
  "x": "2025-01-04T11:00:00.000Z",
  "y": 58,
  "label": "Mid Morning"
}
```

**Expected Response:**

```json
{
  "agent_id": "ag_123",
  "kpi_key": "1000",
  "unit": "orders",
  "data_points": [
    {
      "x": "2025-01-04T10:00:00.000Z",
      "y": 42,
      "label": "Morning Peak"
    },
    {
      "x": "2025-01-04T11:00:00.000Z",
      "y": 58,
      "label": "Mid Morning"
    }
  ],
  "created_at": "2025-01-04T20:00:00.000Z",
  "updated_at": "2025-01-04T20:00:00.000Z"
}
```

## Edge Cases

### 1. Whitespace Handling

**Request:**

```bash
POST /api/v1/kpi/create
Content-Type: application/json

{
  "agent_id": "ag_123",
  "kpi_name": "App Opens",
  "unit": "  events  ",
  "type": "image",
  "graph_type": "line"
}
```

**Expected:** Unit should be stored as "events" (trimmed)

### 2. Empty Unit

**Request:**

```bash
POST /api/v1/kpi/create
Content-Type: application/json

{
  "agent_id": "ag_123",
  "kpi_name": "App Opens",
  "unit": "",
  "type": "image",
  "graph_type": "line"
}
```

**Expected:** Unit should default to "units"

### 3. Case Sensitivity

**Request:**

```bash
POST /api/v1/kpi/create
Content-Type: application/json

{
  "agent_id": "ag_123",
  "kpi_name": "App Opens",
  "unit": "Events",
  "type": "image",
  "graph_type": "line"
}
```

**Expected:** Unit should be stored exactly as "Events" (preserve case)

## Regression Test

### Before Fix (Expected to Fail)

- Create KPI with unit: "events"
- Check database: unit stored as "units" ❌
- Get KPI: unit returned as "units" ❌

### After Fix (Expected to Pass)

- Create KPI with unit: "events"
- Check database: unit stored as "events" ✅
- Get KPI: unit returned as "events" ✅
- Update KPI unit to "orders"
- Get KPI: unit returned as "orders" ✅
- Get graph data: unit returned as "orders" ✅
