export const AGENT_REQUESTS_PROVIDER_TOKEN = 'AGENT_REQUESTS_PROVIDER_TOKEN';
export const AGENT_REQUESTS_COLLECTION = 'agent_requests';

export enum AgentRequestStatus {
  PENDING_CREDENTIALS = 'Pending Credentials',
  SUBMITTED = 'Submitted',
  UNDER_DEVELOPMENT = 'Under Development',
  DELIVERED = 'Delivered',
  INSTALLATION = 'Installation'
} 