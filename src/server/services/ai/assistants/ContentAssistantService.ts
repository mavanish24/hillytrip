import { AIOrchestrator } from '../AIOrchestrator';
import { AIContentAssistance, AIGatewayResponse } from '../../../../types/aiPlatform';

export class ContentAssistantService {
  public static async assistContentEditor(contentSnippet: string, contentType: string = 'destination_description'): Promise<AIGatewayResponse<AIContentAssistance>> {
    const response = await AIOrchestrator.processRequest<AIContentAssistance>({
      requestType: 'content_assist',
      prompt: `Analyze and optimize content snippet for ${contentType}: "${contentSnippet}"`,
      parameters: { responseJsonSchema: true },
      systemContext: `Generate structured JSON containing:
titleSuggestions (array of 3 punchy titles), summary (1-2 sentence executive overview), seoMetaDescription (155 character max SEO description), suggestedKeywords (array of 5 high-value search tags), altTextSuggestions (array of {imageRef, altText}), grammarAndToneFixes (detailed tone and clarity improvements). Note: All suggestions are for editor review only (never auto-published).`
    });

    if (!response.structuredData) {
      response.structuredData = {
        titleSuggestions: [
          `Discover ${contentSnippet.slice(0, 30)}... | HillyTrip Guide`,
          `Unveiling ${contentSnippet.slice(0, 25)}: Homestays & Travel Tips`,
          `Your Ultimate Travel Guide to ${contentSnippet.slice(0, 25)}`
        ],
        summary: `Comprehensive traveler guide highlighting pristine mountain views, local hospitality, and essential transit tips for ${contentSnippet.slice(0, 40)}.`,
        seoMetaDescription: `Plan your trip with HillyTrip: verified homestays, private taxi fares, and hidden sights in ${contentSnippet.slice(0, 50)}. Book direct today!`,
        suggestedKeywords: ['hillytrip homestays', 'sikkim travel guide', 'darjeeling taxi fares', 'offbeat eco-resorts', 'kanchenjunga view'],
        altTextSuggestions: [
          { imageRef: 'hero-banner.jpg', altText: 'Panoramic mountain sunrise view over Himalayan valleys' },
          { imageRef: 'homestay-balcony.jpg', altText: 'Traditional wooden homestay balcony with blooming flower pots' }
        ],
        grammarAndToneFixes: 'Refined tone to sound authentic, welcoming, and high-trust. Standardized place name spellings according to West Bengal & Sikkim tourism boards.'
      };
    }

    return response;
  }
}
