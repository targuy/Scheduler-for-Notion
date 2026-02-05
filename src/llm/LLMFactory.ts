import { ILLMClient } from './BaseLLMClient';
import { OpenAIClient } from './OpenAIClient';
import { AnthropicClient } from './AnthropicClient';
import { LMStudioClient } from './LMStudioClient';
import { LLMProvider } from '../types';

export class LLMFactory {
  static createClient(provider: LLMProvider): ILLMClient {
    switch (provider.name) {
      case 'openai':
        return new OpenAIClient(provider);
      case 'anthropic':
        return new AnthropicClient(provider);
      case 'lmstudio':
        return new LMStudioClient(provider);
      default:
        throw new Error(`Unsupported LLM provider: ${provider.name}`);
    }
  }

  static createFromEnv(providerName: string): ILLMClient {
    const provider: LLMProvider = {
      name: providerName as any,
      model: '',
    };

    switch (providerName) {
      case 'openai':
        provider.apiKey = process.env.OPENAI_API_KEY;
        provider.model = process.env.OPENAI_MODEL || 'gpt-4';
        break;
      case 'anthropic':
        provider.apiKey = process.env.ANTHROPIC_API_KEY;
        provider.model = process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229';
        break;
      case 'lmstudio':
        provider.baseUrl = process.env.LMSTUDIO_API_URL || 'http://localhost:1234/v1';
        provider.model = process.env.LMSTUDIO_MODEL || 'local-model';
        break;
      default:
        throw new Error(`Unknown provider: ${providerName}`);
    }

    return this.createClient(provider);
  }
}
