export type AIProviderType = 'gemini' | 'openai' | 'claude' | 'local';

export type AIRequestType = 
  | 'chat' 
  | 'itinerary' 
  | 'recommendation' 
  | 'search_interpret' 
  | 'content_assist' 
  | 'business_assist' 
  | 'admin_assist' 
  | 'review_analysis';

export interface AIModelConfig {
  id: string;
  provider: AIProviderType;
  modelName: string;
  displayName: string;
  temperature: number;
  maxTokens: number;
  active: boolean;
  isFallback: boolean;
  costPer1kInputUSD: number;
  costPer1kOutputUSD: number;
}

export interface AIGatewayRequest {
  requestType: AIRequestType;
  prompt: string;
  systemContext?: string;
  parameters?: Record<string, any>;
  userId?: string;
  providerOverride?: AIProviderType;
  forceFresh?: boolean;
  temperature?: number;
}

export interface AIGatewayResponse<T = any> {
  id: string;
  requestType: AIRequestType;
  content: string;
  structuredData?: T;
  providerUsed: AIProviderType;
  modelUsed: string;
  latencyMs: number;
  tokensUsed: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  estimatedCostUSD: number;
  cached: boolean;
  fallbackTriggered: boolean;
  timestamp: string;
  knowledgeSourcesUsed?: string[];
}

export interface AIConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  structuredData?: any;
  knowledgeCitations?: string[];
  feedback?: 'positive' | 'negative';
}

export interface AIPromptTemplate {
  id: string;
  slug: string;
  title: string;
  version: number;
  category: AIRequestType | 'general';
  description: string;
  templateText: string;
  variables: string[];
  active: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  category: 'destination' | 'homestay' | 'taxi_route' | 'attraction' | 'offer' | 'blog' | 'review' | 'faq' | 'policy';
  location: string;
  summary: string;
  fullContent: string;
  tags: string[];
  rating?: number;
  priceRange?: string;
  metadata?: Record<string, any>;
}

export interface AITripItineraryDay {
  dayNumber: number;
  title: string;
  theme: string;
  morning: {
    activity: string;
    location: string;
    notes: string;
  };
  afternoon: {
    activity: string;
    location: string;
    notes: string;
  };
  evening: {
    activity: string;
    location: string;
    notes: string;
  };
  estimatedCostINR: number;
  recommendedHomestay?: {
    id: string;
    name: string;
    village: string;
    pricePerNightINR: number;
  };
  recommendedTaxi?: {
    route: string;
    vehicleType: string;
    estimatedFareINR: number;
  };
  localTips: string[];
}

export interface AITripItinerary {
  id: string;
  title: string;
  destination: string;
  durationDays: number;
  travelerType: 'solo' | 'couple' | 'family' | 'group' | 'senior' | 'adventure' | 'budget' | 'luxury';
  season: string;
  summary: string;
  days: AITripItineraryDay[];
  totalEstimatedCostINR: number;
  packingList: string[];
  safetyTips: string[];
  recommendedGear?: string[];
  bestLocalFoodToTry: string[];
  createdAt: string;
}

export interface NaturalLanguageSearchFilter {
  originalQuery: string;
  detectedIntent: string;
  destination?: string;
  budgetMinINR?: number;
  budgetMaxINR?: number;
  stayType?: 'homestay' | 'resort' | 'cottage' | 'tea_estate_stay' | 'farmstay';
  amenities?: string[];
  travelerType?: string;
  tags?: string[];
  taxiRequired?: boolean;
  suggestedLocations: string[];
  confidenceScore: number;
}

export interface AIBusinessOptimization {
  businessId: string;
  businessName: string;
  overallScore: number; // 0 - 100
  titleSuggestion: string;
  descriptionImprovement: string;
  recommendedAmenities: string[];
  photoOptimizationTips: string[];
  suggestedPricingINR?: {
    lowSeason: number;
    peakSeason: number;
  };
  reviewSentimentSummary: {
    positiveThemes: string[];
    negativeThemes: string[];
    sentimentScore: number; // 0 - 100
  };
  suggestedReviewReplies: {
    reviewId: string;
    reviewSnippet: string;
    suggestedReplyText: string;
  }[];
}

export interface AIContentAssistance {
  titleSuggestions: string[];
  summary: string;
  seoMetaDescription: string;
  suggestedKeywords: string[];
  altTextSuggestions: { imageRef: string; altText: string }[];
  grammarAndToneFixes: string;
}

export interface AIAdminInsights {
  trendingSearchQueries: { query: string; count: number; growthPct: number }[];
  searchGaps: { query: string; missingInventoryType: string; priority: 'high' | 'medium' | 'low' }[];
  fraudIndicators: { entityId: string; entityType: string; riskScore: number; reason: string }[];
  contentQualityScores: { id: string; name: string; type: string; score: number; issues: string[] }[];
  platformRecommendationSummary: string;
}

export interface AIObservabilitySummary {
  totalRequestsCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalEstimatedCostUSD: number;
  avgLatencyMs: number;
  cacheHitPercentage: number;
  errorPercentage: number;
  providerUsageDistribution: Record<AIProviderType, number>;
  requestTypeDistribution: Record<AIRequestType, number>;
  recentRequestsLogs: AIGatewayResponse[];
}

export interface AIFeedbackRecord {
  id: string;
  requestId: string;
  rating: 'positive' | 'negative';
  comment?: string;
  timestamp: string;
  userId?: string;
}
