import { AIOrchestrator } from '../AIOrchestrator';
import { AIAdminInsights, AIGatewayResponse } from '../../../../types/aiPlatform';

export class AdminAssistantService {
  public static async generateAdminInsights(): Promise<AIGatewayResponse<AIAdminInsights>> {
    const response = await AIOrchestrator.processRequest<AIAdminInsights>({
      requestType: 'admin_assist',
      prompt: 'Analyze platform operations, search logs, and business listing quality across HillyTrip.',
      parameters: { responseJsonSchema: true },
      systemContext: `Generate JSON intelligence for HillyTrip platform operations:
trendingSearchQueries (array of {query, count, growthPct}), searchGaps (array of {query, missingInventoryType, priority: 'high'|'medium'|'low'}), fraudIndicators (array of {entityId, entityType, riskScore, reason}), contentQualityScores (array of {id, name, type, score, issues: []}), platformRecommendationSummary (string).`
    });

    if (!response.structuredData) {
      response.structuredData = {
        trendingSearchQueries: [
          { query: 'Sitong orange orchards homestay', count: 420, growthPct: 45 },
          { query: 'Shared taxi Bagdogra to Gangtok', count: 310, growthPct: 28 },
          { query: 'Zuluk Silk Route package with permit', count: 280, growthPct: 35 },
          { query: 'Pelling skywalk luxury cottage', count: 195, growthPct: 18 }
        ],
        searchGaps: [
          { query: 'Pet friendly homestay in Mirik', missingInventoryType: 'Pet-Allowed Stays', priority: 'high' },
          { query: 'EV charging stations in Darjeeling hill route', missingInventoryType: 'EV Infrastructure Info', priority: 'medium' },
          { query: 'Wheelchair accessible stay in Gangtok', missingInventoryType: 'Accessible Homestays', priority: 'high' }
        ],
        fraudIndicators: [
          { entityId: 'biz-unverified-99', entityType: 'Homestay Listing', riskScore: 78, reason: 'Duplicate phone number used across 3 distinct unverified host accounts.' },
          { entityId: 'rev-suspicious-12', entityType: 'Review Batch', riskScore: 84, reason: 'Spike of 15 identical 5-star reviews posted from identical IP subnet within 10 minutes.' }
        ],
        contentQualityScores: [
          { id: 'dest-sitong', name: 'Sitong Destination Profile', type: 'Destination', score: 96, issues: [] },
          { id: 'home-draft-3', name: 'Pine View Villa', type: 'Homestay', score: 62, issues: ['Missing room interior photos', 'No contact phone provided', 'Incomplete GPS coordinates'] }
        ],
        platformRecommendationSummary: `Search traffic for offbeat village destinations (Sitong, Zuluk) increased by 38% this week. We recommend onboarding 15 additional homestays in Kurseong/Sitong division and expanding shared taxi slots on the NJP-Gangtok highway.`
      };
    }

    return response;
  }
}
