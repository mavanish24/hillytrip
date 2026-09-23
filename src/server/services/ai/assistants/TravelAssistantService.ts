import { AIOrchestrator } from '../AIOrchestrator';
import { AIGatewayResponse } from '../../../../types/aiPlatform';

export class TravelAssistantService {
  public static async askTravelCompanion(userPrompt: string, userId?: string): Promise<AIGatewayResponse> {
    return AIOrchestrator.processRequest({
      requestType: 'chat',
      prompt: userPrompt,
      userId,
      systemContext: `You are HillyTrip's AI Travel Companion for Darjeeling, Sikkim, Kalimpong, Dooars, and North Bengal. Provide helpful, accurate advice regarding homestays, taxi routes, weather, packing essentials, and cultural norms.`
    });
  }
}
