export interface IAgentResponse {
  agent_id: string;
  message: string;
}

export interface IAgentWebhookPayload {
  agentId: string;
  businessId: string;
  message: string;
  executionMode: string;
} 