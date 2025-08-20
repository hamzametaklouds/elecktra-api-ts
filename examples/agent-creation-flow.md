# Agent Creation Flow Example

## Prerequisites

1. User must be authenticated with JWT token
2. Tools must be seeded first: `POST /tools/seed`
3. User should have appropriate role (BUSINESS_ADMIN, BUSINESS_OWNER, etc.)

## Step 1: Create Draft Agent

```bash
curl -X POST http://localhost:3000/agents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Email Assistant Agent",
    "description": "Helps manage and automate email tasks",
    "display_description": "This agent helps you manage emails efficiently",
    "service_type": "automation",
    "assistant_id": "asst_12345",
    "image": "https://example.com/agent-image.png",
    "tags": ["EMAIL", "AUTOMATION", "PRODUCTIVITY"]
  }'
```

**Response:**

```json
{
  "status": true,
  "statusCode": 201,
  "message": "Agent successfully created",
  "data": {
    "_id": "65f7b3b3b3b3b3b3b3b3b3b3",
    "title": "Email Assistant Agent",
    "status": "Draft",
    "tags": ["EMAIL", "AUTOMATION", "PRODUCTIVITY"],
    "tools_selected": [],
    "tools_count": 0,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

## Step 2: Select Tools

First, get available tools:

```bash
curl -X GET http://localhost:3000/tools \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Then select tools for the agent:

```bash
curl -X PUT http://localhost:3000/agents/65f7b3b3b3b3b3b3b3b3b3b3/tools \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tools_selected": ["GMAIL_TOOL_ID", "GDRIVE_TOOL_ID"]
  }'
```

## Step 3: Assign & Invite

```bash
curl -X PUT http://localhost:3000/agents/65f7b3b3b3b3b3b3b3b3b3b3/assignment \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "60f7b3b3b3b3b3b3b3b3b3b5",
    "invitees": [
      {
        "email": "user1@example.com",
        "name": "John Doe",
        "role": "USER"
      }
    ]
  }'
```

## Step 4: Integrate

```bash
curl -X POST http://localhost:3000/agents/65f7b3b3b3b3b3b3b3b3b3b3/integrate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Final Response:**

```json
{
  "status": true,
  "statusCode": 200,
  "message": "Agent integrated successfully",
  "data": {
    "agent": {
      "_id": "65f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Email Assistant Agent",
      "status": "Active",
      "tools_selected": [
        {
          "_id": "tool1",
          "key": "gmail",
          "title": "Gmail",
          "icon_url": "https://...",
          "category": "email"
        }
      ],
      "tools_count": 2,
      "client_id": {
        "first_name": "John",
        "last_name": "Doe"
      }
    },
    "invitations": [
      {
        "_id": "inv1",
        "email": "user1@example.com",
        "invitation_status": "Pending",
        "created_at": "2024-01-15T10:05:00Z"
      }
    ]
  }
}
```

## Alternative: Get Agent Details Anytime

```bash
curl -X GET http://localhost:3000/agents/65f7b3b3b3b3b3b3b3b3b3b3/details \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Search Agents

```bash
curl -X GET "http://localhost:3000/agents/search?q=email&status=Active&tags=EMAIL" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
