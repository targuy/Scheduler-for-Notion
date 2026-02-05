import Anthropic from '@anthropic-ai/sdk';
import { BaseLLMClient } from './BaseLLMClient';
import { LLMProvider, LLMResponse } from '../types';

export class AnthropicClient extends BaseLLMClient {
  private client: Anthropic;

  constructor(provider: LLMProvider) {
    super(provider);
    this.client = new Anthropic({
      apiKey: provider.apiKey,
    });
  }

  async sendPrompt(prompt: string, context?: string): Promise<LLMResponse> {
    try {
      const fullPrompt = this.formatPromptWithContext(prompt, context);
      
      const response = await this.client.messages.create({
        model: this.provider.model,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ],
      });

      const content = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : '';
      
      const usage = response.usage;

      return {
        content,
        usage: {
          promptTokens: usage.input_tokens,
          completionTokens: usage.output_tokens,
          totalTokens: usage.input_tokens + usage.output_tokens,
        },
        provider: 'anthropic'
      };
    } catch (error) {
      throw new Error(`Anthropic API error: ${error}`);
    }
  }
}
