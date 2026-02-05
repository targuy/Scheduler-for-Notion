import OpenAI from 'openai';
import { BaseLLMClient } from './BaseLLMClient';
import { LLMProvider, LLMResponse } from '../types';

export class OpenAIClient extends BaseLLMClient {
  private client: OpenAI;

  constructor(provider: LLMProvider) {
    super(provider);
    this.client = new OpenAI({
      apiKey: provider.apiKey,
    });
  }

  async sendPrompt(prompt: string, context?: string): Promise<LLMResponse> {
    try {
      const fullPrompt = this.formatPromptWithContext(prompt, context);
      
      const response = await this.client.chat.completions.create({
        model: this.provider.model,
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || '';
      const usage = response.usage;

      return {
        content,
        usage: usage ? {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        } : undefined,
        provider: 'openai'
      };
    } catch (error) {
      throw new Error(`OpenAI API error: ${error}`);
    }
  }
}
