export interface NotionContext {
  pageId?: string;
  databaseId?: string;
  content: any;
  metadata?: {
    title?: string;
    properties?: Record<string, any>;
  };
}

export interface LLMProvider {
  name: 'openai' | 'anthropic' | 'lmstudio';
  apiKey?: string;
  model: string;
  baseUrl?: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: string;
}

export interface AgentAction {
  type: 'read' | 'write' | 'update' | 'query' | 'llm';
  target?: string;
  condition?: (context: any) => boolean;
  params?: Record<string, any>;
  prompt?: string;
}

export interface AgentWorkflow {
  name: string;
  description?: string;
  actions: AgentAction[];
  loop?: {
    items: string;
    actions: AgentAction[];
  };
}

export interface SchedulerConfig {
  cronSchedule: string;
  workflows: AgentWorkflow[];
  enabled: boolean;
}

export interface MCPContext {
  serverUrl: string;
  notionData: NotionContext;
}
