import { AIProviderInterface } from './AIProviderInterface';
import { GeminiProvider } from './GeminiProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { ClaudeProvider } from './ClaudeProvider';
import { AIProviderType, AIModelConfig } from '../../../../types/aiPlatform';

export class ProviderFactory {
  private static providers: Map<AIProviderType, AIProviderInterface> = new Map();
  private static defaultProvider: AIProviderType = 'gemini';

  private static fallbackOrder: AIProviderType[] = ['gemini', 'openai', 'claude'];

  private static modelRegistry: AIModelConfig[] = [
    {
      id: 'gemini-3.7-flash',
      provider: 'gemini',
      modelName: 'gemini-3.7-flash',
      displayName: 'Google Gemini 3.7 Flash',
      temperature: 0.7,
      maxTokens: 2048,
      active: true,
      isFallback: false,
      costPer1kInputUSD: 0.00015,
      costPer1kOutputUSD: 0.0006
    },
    {
      id: 'gpt-4o',
      provider: 'openai',
      modelName: 'gpt-4o',
      displayName: 'OpenAI GPT-4o',
      temperature: 0.7,
      maxTokens: 2048,
      active: true,
      isFallback: true,
      costPer1kInputUSD: 0.0025,
      costPer1kOutputUSD: 0.010
    },
    {
      id: 'claude-3-5-sonnet',
      provider: 'claude',
      modelName: 'claude-3-5-sonnet',
      displayName: 'Anthropic Claude 3.5 Sonnet',
      temperature: 0.7,
      maxTokens: 2048,
      active: true,
      isFallback: true,
      costPer1kInputUSD: 0.003,
      costPer1kOutputUSD: 0.015
    }
  ];

  public static initialize(): void {
    if (this.providers.size === 0) {
      this.providers.set('gemini', new GeminiProvider());
      this.providers.set('openai', new OpenAIProvider());
      this.providers.set('claude', new ClaudeProvider());
    }
  }

  public static getProvider(type?: AIProviderType): AIProviderInterface {
    this.initialize();
    const targetType = type || this.defaultProvider;
    const provider = this.providers.get(targetType);

    if (provider && provider.isAvailable()) {
      return provider;
    }

    // Attempt fallback
    for (const fallbackType of this.fallbackOrder) {
      const fbProvider = this.providers.get(fallbackType);
      if (fbProvider && fbProvider.isAvailable()) {
        console.warn(`[ProviderFactory] Target provider '${targetType}' unavailable. Falling back to '${fallbackType}'.`);
        return fbProvider;
      }
    }

    // Default to Gemini as guaranteed fallback
    return this.providers.get('gemini')!;
  }

  public static getModelConfigs(): AIModelConfig[] {
    return this.modelRegistry;
  }

  public static updateModelConfig(id: string, updates: Partial<AIModelConfig>): void {
    const idx = this.modelRegistry.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.modelRegistry[idx] = { ...this.modelRegistry[idx], ...updates };
    }
  }
}
