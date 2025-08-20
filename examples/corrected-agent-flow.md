# Corrected Agent Creation Flow

## 🎯 **The Right Way to Create an Agent**

### **Initial Creation (Required)**

```http
POST /agents
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Email Assistant Agent",
  "description": "Helps manage and automate email tasks",
  "display_description": "This agent helps you manage emails efficiently",
  "service_type": "automation",
  "assistant_id": "asst_12345",
  "image": "https://example.com/agent-image.png",
  "tags": ["EMAIL", "AUTOMATION"]
}
```

**Response:**

```json
{
  "status": true,
  "statusCode": 201,
  "message": "Agent successfully created",
  "data": {
    "_id": "65f7b3b3b3b3b3b3b3b3b3b3", // ← USE THIS ID FOR NEXT STEPS
    "title": "Email Assistant Agent",
    "status": "Draft", // ← Starts as Draft
    "tools_selected": [], // ← Empty initially
    "tools_count": 0
  }
}
```

---

## 🔄 **Wizard Steps (Using the Agent ID)**

### **Step 1: Update Basic Info (OPTIONAL)**

_If you want to modify what you created_

```http
PUT /agents/65f7b3b3b3b3b3b3b3b3b3b3/basic
Authorization: Bearer <token>

{
  "title": "Updated Email Assistant",
  "tags": ["EMAIL", "AUTOMATION", "PRODUCTIVITY"]
}
```

### **Step 2: Select Tools (REQUIRED)**

```http
PUT /agents/65f7b3b3b3b3b3b3b3b3b3b3/tools
Authorization: Bearer <token>

{
  "tools_selected": ["gmail_tool_id", "gdrive_tool_id"]
}
```

### **Step 3: Assign & Invite (OPTIONAL)**

```http
PUT /agents/65f7b3b3b3b3b3b3b3b3b3b3/assignment
Authorization: Bearer <token>

{
  "client_id": "user_id_to_assign_to",
  "invitees": [
    {
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    }
  ]
}
```

### **Step 4: Integrate (REQUIRED)**

```http
POST /agents/65f7b3b3b3b3b3b3b3b3b3b3/integrate
Authorization: Bearer <token>
```

**Final Result:**

```json
{
  "data": {
    "agent": {
      "_id": "65f7b3b3b3b3b3b3b3b3b3b3",
      "status": "Active", // ← Now Active!
      "tools_count": 2
    }
  }
}
```

---

## 🎨 **Frontend Implementation Examples**

### **React/TypeScript Example**

```typescript
interface Agent {
  _id: string;
  title: string;
  status: "Draft" | "Active" | "Maintenance" | "Terminated";
  tools_selected: string[];
}

class AgentWizard {
  private agentId: string | null = null;

  // Step 0: Create initial agent
  async createAgent(basicInfo: CreateAgentDto): Promise<string> {
    const response = await fetch("/agents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(basicInfo),
    });

    const result = await response.json();
    this.agentId = result.data._id; // Store for next steps
    return this.agentId;
  }

  // Step 1: Update basic (optional)
  async updateBasic(updates: UpdateAgentBasicDto) {
    if (!this.agentId) throw new Error("Must create agent first");

    await fetch(`/agents/${this.agentId}/basic`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
  }

  // Step 2: Select tools (required)
  async selectTools(toolIds: string[]) {
    if (!this.agentId) throw new Error("Must create agent first");

    await fetch(`/agents/${this.agentId}/tools`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tools_selected: toolIds }),
    });
  }

  // Step 4: Finalize (required)
  async integrate() {
    if (!this.agentId) throw new Error("Must create agent first");

    const response = await fetch(`/agents/${this.agentId}/integrate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.json(); // Active agent
  }
}
```

### **Usage in Component**

```typescript
const createAgentFlow = async () => {
  const wizard = new AgentWizard();

  // Create initial agent (gets ID)
  const agentId = await wizard.createAgent({
    title: "My Agent",
    description: "Test agent",
    service_type: "automation",
  });

  // Select tools (required)
  await wizard.selectTools(["gmail_id", "drive_id"]);

  // Finalize (required)
  const activeAgent = await wizard.integrate();

  console.log("Agent is now active:", activeAgent);
};
```

---

## 🔍 **Why This Design Makes Sense**

### **1. Progressive Enhancement**

- ✅ Create minimal agent first (get ID)
- ✅ Build upon it step by step
- ✅ Can save progress at any point

### **2. Clear HTTP Semantics**

- `POST /agents` = Create new resource
- `PUT /agents/:id/...` = Update existing resource
- `POST /agents/:id/integrate` = Action on existing resource

### **3. Frontend Benefits**

- Store agent ID in state/localStorage
- Show progress indicator
- Allow users to resume wizard
- Validate each step independently

### **4. Flexible Flow**

```
Required: POST /agents → PUT /:id/tools → POST /:id/integrate
Optional: PUT /:id/basic, PUT /:id/assignment (can be done anytime)
```

This corrected flow is much clearer and follows REST conventions properly!
