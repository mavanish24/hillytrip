import { AIPromptTemplate, AIRequestType } from '../../../types/aiPlatform';

export class PromptService {
  private static promptLibrary: Map<string, AIPromptTemplate> = new Map([
    [
      'travel_companion',
      {
        id: 'prompt-travel-companion',
        slug: 'travel_companion',
        title: 'AI Travel Companion System Prompt',
        version: 1,
        category: 'chat',
        description: 'Main prompt for conversational travel advice grounded in HillyTrip regional database.',
        templateText: `You are the HillyTrip AI Travel Companion — an expert, friendly local travel intelligence assistant for Darjeeling, Sikkim, Kalimpong, Dooars, and Eastern Himalayas.
Always prioritize real HillyTrip platform knowledge provided in context. Never invent non-existent hotels or roads. Provide clear, actionable advice on local homestays, taxi routes, seasonal weather, safety, and cultural etiquette.`,
        variables: ['user_query', 'knowledge_context'],
        active: true,
        updatedAt: new Date().toISOString(),
        updatedBy: 'system_admin'
      }
    ],
    [
      'itinerary_generator',
      {
        id: 'prompt-itinerary-generator',
        slug: 'itinerary_generator',
        title: 'Structured Trip Itinerary Planner',
        version: 2,
        category: 'itinerary',
        description: 'Generates JSON structured itineraries for solo, family, couple, and adventure trips.',
        templateText: `You are HillyTrip's master itinerary architect. Generate a realistic day-by-day travel itinerary strictly formatted in JSON. Recommend verified HillyTrip homestays and taxi connections. Account for Himalayan road travel times and altitude adjustment.`,
        variables: ['destination', 'duration_days', 'traveler_type', 'season', 'budget'],
        active: true,
        updatedAt: new Date().toISOString(),
        updatedBy: 'system_admin'
      }
    ],
    [
      'search_interpreter',
      {
        id: 'prompt-search-interpreter',
        slug: 'search_interpreter',
        title: 'Natural Language Search Interpreter',
        version: 1,
        category: 'search_interpret',
        description: 'Converts unstructured natural language search queries into structured JSON search filters.',
        templateText: `Parse the traveler's natural language query into JSON structured search parameters (destination, budget range, stay type, required amenities, tags, taxi needs).`,
        variables: ['query'],
        active: true,
        updatedAt: new Date().toISOString(),
        updatedBy: 'system_admin'
      }
    ],
    [
      'business_optimizer',
      {
        id: 'prompt-business-optimizer',
        slug: 'business_optimizer',
        title: 'HillyTrip Business & Listing Optimizer',
        version: 1,
        category: 'business_assist',
        description: 'Generates listing optimization scores, description improvements, and automated review response suggestions.',
        templateText: `You are HillyTrip's hospitality business consultant. Analyze the provided homestay/taxi listing details and recent guest reviews to suggest high-converting improvements, photos, amenities, and thoughtful review responses.`,
        variables: ['business_data', 'reviews'],
        active: true,
        updatedAt: new Date().toISOString(),
        updatedBy: 'system_admin'
      }
    ]
  ]);

  public static getPrompt(slug: string): AIPromptTemplate | undefined {
    return this.promptLibrary.get(slug);
  }

  public static getAllPrompts(): AIPromptTemplate[] {
    return Array.from(this.promptLibrary.values());
  }

  public static updatePrompt(slug: string, newText: string, updatedBy: string = 'admin'): AIPromptTemplate {
    const existing = this.promptLibrary.get(slug);
    if (!existing) {
      throw new Error(`Prompt with slug ${slug} not found`);
    }

    const updated: AIPromptTemplate = {
      ...existing,
      templateText: newText,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy
    };

    this.promptLibrary.set(slug, updated);
    return updated;
  }
}
