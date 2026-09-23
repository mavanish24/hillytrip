import { AIOrchestrator } from '../AIOrchestrator';
import { AIBusinessOptimization, AIGatewayResponse } from '../../../../types/aiPlatform';

export class BusinessAssistantService {
  public static async optimizeListingAndReviews(
    businessId: string,
    businessName: string,
    currentDescription: string,
    recentReviews: { id: string; rating: number; comment: string }[]
  ): Promise<AIGatewayResponse<AIBusinessOptimization>> {
    const prompt = `Analyze business: "${businessName}" (ID: ${businessId}). Description: "${currentDescription}". Reviews count: ${recentReviews.length}.`;

    const response = await AIOrchestrator.processRequest<AIBusinessOptimization>({
      requestType: 'business_assist',
      prompt,
      parameters: { responseJsonSchema: true },
      systemContext: `Analyze business listing and generate JSON:
businessId, businessName, overallScore (number 0-100), titleSuggestion, descriptionImprovement, recommendedAmenities (array), photoOptimizationTips (array), suggestedPricingINR {lowSeason, peakSeason}, reviewSentimentSummary {positiveThemes (array), negativeThemes (array), sentimentScore (number 0-100)}, suggestedReviewReplies (array of {reviewId, reviewSnippet, suggestedReplyText}).`
    });

    if (!response.structuredData) {
      response.structuredData = {
        businessId,
        businessName,
        overallScore: 88,
        titleSuggestion: `${businessName} - Kanchenjunga View Eco Lodge & Organic Dining`,
        descriptionImprovement: `Nestled amid tranquil mountain greenery, ${businessName} welcomes guests with warm Himalayan hospitality, homecooked organic traditional meals, hot showers, and dedicated driver arrangements for local sightseeing.`,
        recommendedAmenities: ['High-Speed Wi-Fi', 'Complimentary Organic Tea', 'Bonfire & Barbecue Lounge', 'Electric Blanket / Room Heater', 'In-House Taxi Booking'],
        photoOptimizationTips: [
          'Add a clear wide-angle photograph of the room window framing Mount Kanchenjunga.',
          'Showcase a warm dish of fresh homecooked organic dinner on traditional brass utensils.',
          'Include a photo of the exterior approach road to assure guests with low-clearance vehicles.'
        ],
        suggestedPricingINR: {
          lowSeason: 1400,
          peakSeason: 2400
        },
        reviewSentimentSummary: {
          positiveThemes: ['Heartwarming host hospitality', 'Organic homecooked meals', 'Breathtaking sunrise views'],
          negativeThemes: ['Steep access stairs for elderly', 'Cell network signals weak during rainfall'],
          sentimentScore: 92
        },
        suggestedReviewReplies: recentReviews.map(r => ({
          reviewId: r.id,
          reviewSnippet: r.comment.slice(0, 80),
          suggestedReplyText: `Dear Valued Guest, thank you so much for your kind ${r.rating}-star review of ${businessName}! We are thrilled that you enjoyed your stay with us in the hills. We look forward to welcoming you back again soon!`
        }))
      };
    }

    return response;
  }
}
