import { AIProviderType } from '../../../../types/aiPlatform';

export interface ProviderCompletionOptions {
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
  responseJsonSchema?: boolean;
}

export interface ProviderCompletionResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  modelUsed: string;
  provider: AIProviderType;
  latencyMs: number;
  rawResponse?: any;
}

export interface AIProviderInterface {
  readonly providerType: AIProviderType;
  isAvailable(): boolean;
  generateCompletion(
    prompt: string, 
    options?: ProviderCompletionOptions
  ): Promise<ProviderCompletionResult>;
}
