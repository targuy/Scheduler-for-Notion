import axios from 'axios';
import { BaseLLMClient } from './BaseLLMClient';
import { LLMProvider, LLMResponse } from '../types';

export class LMStudioClient extends BaseLLMClient {
  constructor(provider: LLMProvider) {
    super(provider);
  }

  async sendPrompt(prompt: string, context?: string): Promise<LLMResponse> {
    try {
      const fullPrompt = this.formatPromptWithContext(prompt, context);
      
      const response = await axios.post(
        `${this.provider.baseUrl}/chat/completions`,
        {
          model: this.provider.model,
          messages: [
            {
              role: 'user',
              content: fullPrompt
            }
          ],
          temperature: 0.7,
        }
      );

      const data = response.data;
      const content = data.choices[0]?.message?.content || '';
      const usage = data.usage;

      return {
        content,
        usage: usage ? {
          promptTokens: usage.prompt_tokens || 0,
          completionTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0,
        } : undefined,
        provider: 'lmstudio'
      };
    } catch (error) {
      throw new Error(`LMStudio API error: ${error}`);
    }
  }
}
