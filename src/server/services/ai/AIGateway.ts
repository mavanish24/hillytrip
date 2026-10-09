import { AIGatewayRequest, AIGatewayResponse, AIProviderType } from '../../../types/aiPlatform';
import { ProviderFactory } from './providers/ProviderFactory';
import { AIObservabilityService } from './AIObservabilityService';

export class AIGateway {
  private static responseCache: Map<string, AIGatewayResponse> = new Map();
  private static userRequestCount: Map<string, { count: number; resetAt: number }> = new Map();

  private static RATE_LIMIT_MAX = 30; // Max 30 requests per minute per user/session
  private static RATE_LIMIT_WINDOW_MS = 60 * 1000;

  public static async executeRequest<T = any>(
    request: AIGatewayRequest,
    executionFn: (provider: AIProviderType) => Promise<{
      text: string;
      structuredData?: T;
      inputTokens: number;
      outputTokens: number;
      modelUsed: string;
    }>
  ): Promise<AIGatewayResponse<T>> {
    const startTime = Date.now();
    const userId = request.userId || 'anonymous_guest';

    // 1. Rate Limiting Check
    this.checkRateLimit(userId);

    // 2. Cache Check
    const cacheKey = this.generateCacheKey(request);
    if (!request.forceFresh && this.responseCache.has(cacheKey)) {
      const cached = this.responseCache.get(cacheKey)!;
      return {
        ...cached,
        cached: true,
        timestamp: new Date().toISOString()
      };
    }

    // 3. Provider Selection & Fallback Handling
    let providerType = request.providerOverride || 'gemini';
    let fallbackTriggered = false;

    try {
      const result = await executionFn(providerType);
      const latencyMs = Date.now() - startTime;
      const estimatedCostUSD = this.calculateCost(providerType, result.inputTokens, result.outputTokens);

      const gatewayResponse: AIGatewayResponse<T> = {
        id: `air-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        requestType: request.requestType,
        content: result.text,
        structuredData: result.structuredData,
        providerUsed: providerType,
        modelUsed: result.modelUsed,
        latencyMs,
        tokensUsed: {
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          totalTokens: result.inputTokens + result.outputTokens
        },
        estimatedCostUSD,
        cached: false,
        fallbackTriggered,
        timestamp: new Date().toISOString()
      };

      // Store in Cache & Observability
      this.responseCache.set(cacheKey, gatewayResponse);
      AIObservabilityService.logRequest(gatewayResponse);

      return gatewayResponse;
    } catch (primaryError) {
      console.warn(`[AIGateway] Primary provider ${providerType} failed. Triggering orchestrator fallback...`);
      fallbackTriggered = true;
      providerType = 'openai'; // Fallback provider

      const fallbackResult = await executionFn(providerType);
      const latencyMs = Date.now() - startTime;
      const estimatedCostUSD = this.calculateCost(providerType, fallbackResult.inputTokens, fallbackResult.outputTokens);

      const gatewayResponse: AIGatewayResponse<T> = {
        id: `air-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        requestType: request.requestType,
        content: fallbackResult.text,
        structuredData: fallbackResult.structuredData,
        providerUsed: providerType,
        modelUsed: fallbackResult.modelUsed,
        latencyMs,
        tokensUsed: {
          inputTokens: fallbackResult.inputTokens,
          outputTokens: fallbackResult.outputTokens,
          totalTokens: fallbackResult.inputTokens + fallbackResult.outputTokens
        },
        estimatedCostUSD,
        cached: false,
        fallbackTriggered,
        timestamp: new Date().toISOString()
      };

      AIObservabilityService.logRequest(gatewayResponse);
      return gatewayResponse;
    }
  }

  private static checkRateLimit(userId: string): void {
    const now = Date.now();
    const userLimit = this.userRequestCount.get(userId);

    if (!userLimit || now > userLimit.resetAt) {
      this.userRequestCount.set(userId, {
        count: 1,
        resetAt: now + this.RATE_LIMIT_WINDOW_MS
      });
      return;
    }

    if (userLimit.count >= this.RATE_LIMIT_MAX) {
      throw new Error(`Rate limit exceeded for user ${userId}. Maximum ${this.RATE_LIMIT_MAX} AI requests allowed per minute.`);
    }

    userLimit.count++;
  }

  private static generateCacheKey(req: AIGatewayRequest): string {
    return `${req.requestType}:${req.prompt.slice(0, 100)}:${JSON.stringify(req.parameters || {})}`;
  }

  private static calculateCost(provider: AIProviderType, inputTokens: number, outputTokens: number): number {
    const modelConfigs = ProviderFactory.getModelConfigs();
    const config = modelConfigs.find(m => m.provider === provider) || modelConfigs[0];
    const inputCost = (inputTokens / 1000) * config.costPer1kInputUSD;
    const outputCost = (outputTokens / 1000) * config.costPer1kOutputUSD;
    return Number((inputCost + outputCost).toFixed(6));
  }
}
