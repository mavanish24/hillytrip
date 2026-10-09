import { AIGatewayResponse, AIObservabilitySummary, AIFeedbackRecord, AIProviderType, AIRequestType } from '../../../types/aiPlatform';

export class AIObservabilityService {
  private static logsBuffer: AIGatewayResponse[] = [];
  private static feedbackBuffer: AIFeedbackRecord[] = [];
  private static MAX_LOGS = 100;

  public static logRequest(response: AIGatewayResponse): void {
    this.logsBuffer.unshift(response);
    if (this.logsBuffer.length > this.MAX_LOGS) {
      this.logsBuffer.pop();
    }
  }

  public static logFeedback(requestId: string, rating: 'positive' | 'negative', comment?: string, userId?: string): AIFeedbackRecord {
    const feedback: AIFeedbackRecord = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      requestId,
      rating,
      comment,
      timestamp: new Date().toISOString(),
      userId
    };
    this.feedbackBuffer.unshift(feedback);
    return feedback;
  }

  public static getObservabilitySummary(): AIObservabilitySummary {
    const totalRequestsCount = this.logsBuffer.length;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalEstimatedCostUSD = 0;
    let totalLatencyMs = 0;
    let cacheHits = 0;

    const providerUsageDistribution: Record<AIProviderType, number> = {
      gemini: 0,
      openai: 0,
      claude: 0,
      local: 0
    };

    const requestTypeDistribution: Record<AIRequestType, number> = {
      chat: 0,
      itinerary: 0,
      recommendation: 0,
      search_interpret: 0,
      content_assist: 0,
      business_assist: 0,
      admin_assist: 0,
      review_analysis: 0
    };

    for (const log of this.logsBuffer) {
      totalInputTokens += log.tokensUsed.inputTokens;
      totalOutputTokens += log.tokensUsed.outputTokens;
      totalEstimatedCostUSD += log.estimatedCostUSD;
      totalLatencyMs += log.latencyMs;

      if (log.cached) cacheHits++;

      providerUsageDistribution[log.providerUsed] = (providerUsageDistribution[log.providerUsed] || 0) + 1;
      requestTypeDistribution[log.requestType] = (requestTypeDistribution[log.requestType] || 0) + 1;
    }

    const avgLatencyMs = totalRequestsCount > 0 ? Math.round(totalLatencyMs / totalRequestsCount) : 0;
    const cacheHitPercentage = totalRequestsCount > 0 ? Math.round((cacheHits / totalRequestsCount) * 100) : 0;

    return {
      totalRequestsCount,
      totalInputTokens,
      totalOutputTokens,
      totalEstimatedCostUSD: Number(totalEstimatedCostUSD.toFixed(5)),
      avgLatencyMs,
      cacheHitPercentage,
      errorPercentage: 0,
      providerUsageDistribution,
      requestTypeDistribution,
      recentRequestsLogs: this.logsBuffer.slice(0, 30)
    };
  }
}
