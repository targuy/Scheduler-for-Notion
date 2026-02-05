import { LLMProvider, LLMResponse } from '../types';

export interface ILLMClient {
  sendPrompt(prompt: string, context?: string): Promise<LLMResponse>;
}

export abstract class BaseLLMClient implements ILLMClient {
  protected provider: LLMProvider;

  constructor(provider: LLMProvider) {
    this.provider = provider;
  }

  abstract sendPrompt(prompt: string, context?: string): Promise<LLMResponse>;

  protected formatPromptWithContext(prompt: string, context?: string): string {
    if (!context) return prompt;
    
    return `Context from Notion:
---
${context}
---

Task: ${prompt}`;
  }
}
