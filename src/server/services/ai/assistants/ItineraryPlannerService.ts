import { AIOrchestrator } from '../AIOrchestrator';
import { AITripItinerary, AIGatewayResponse } from '../../../../types/aiPlatform';

export interface ItineraryGenerationParams {
  destination: string;
  durationDays: number;
  travelerType: 'solo' | 'couple' | 'family' | 'group' | 'senior' | 'adventure' | 'budget' | 'luxury';
  season?: string;
  budgetTotalINR?: number;
  userId?: string;
}

export class ItineraryPlannerService {
  public static async generateItinerary(params: ItineraryGenerationParams): Promise<AIGatewayResponse<AITripItinerary>> {
    const prompt = `Generate a realistic ${params.durationDays}-day travel itinerary for ${params.destination} tailored for a ${params.travelerType} traveler during ${params.season || 'current'} season.`;

    const response = await AIOrchestrator.processRequest<AITripItinerary>({
      requestType: 'itinerary',
      prompt,
      userId: params.userId,
      parameters: { responseJsonSchema: true },
      systemContext: `Generate a structured JSON itinerary conforming to HillyTrip verified platform locations. Return structured JSON with:
title, destination, durationDays, travelerType, season, summary, totalEstimatedCostINR, packingList (array of strings), safetyTips (array of strings), bestLocalFoodToTry (array of strings), and days array where each day contains:
dayNumber, title, theme, morning {activity, location, notes}, afternoon {activity, location, notes}, evening {activity, location, notes}, estimatedCostINR, recommendedHomestay {id, name, village, pricePerNightINR}, recommendedTaxi {route, vehicleType, estimatedFareINR}, localTips (array of strings).`
    });

    if (!response.structuredData) {
      // Create rich fallback structured object if provider returned text
      response.structuredData = this.buildFallbackItinerary(params);
    }

    return response;
  }

  private static buildFallbackItinerary(params: ItineraryGenerationParams): AITripItinerary {
    const dest = params.destination || 'Darjeeling & Sitong';
    const daysCount = params.durationDays || 3;

    return {
      id: `itin-${Date.now()}`,
      title: `${daysCount}-Day ${params.travelerType.toUpperCase()} Journey to ${dest}`,
      destination: dest,
      durationDays: daysCount,
      travelerType: params.travelerType,
      season: params.season || 'Autumn/Winter',
      summary: `A carefully curated ${daysCount}-day Himalayan itinerary in ${dest} featuring organic eco-homestays, private taxi transfers, scenic tea gardens, and authentic local cuisine.`,
      days: Array.from({ length: daysCount }, (_, i) => ({
        dayNumber: i + 1,
        title: i === 0 ? 'Arrival & Serene Valley Settling' : i === daysCount - 1 ? 'Sunrise Spectacle & Farewell' : 'Highland Exploration & Local Heritage',
        theme: i === 0 ? 'Acclimatization & Nature Walk' : 'Cultural Sightseeing',
        morning: {
          activity: i === 0 ? 'Pick up from NJP / Bagdogra Airport by reserved taxi' : 'Tiger Hill Sunrise & Himalayan Mountaineering Institute',
          location: i === 0 ? 'NJP / Bagdogra Route' : 'Tiger Hill, Darjeeling',
          notes: 'Keep warm clothes handy for early morning mountain breezes.'
        },
        afternoon: {
          activity: 'Organic lunch at local homestay followed by tea garden walk',
          location: 'Happy Valley Tea Estate',
          notes: 'Enjoy freshly brewed local tea.'
        },
        evening: {
          activity: 'Cozy fireplace lounge and traditional Nepali/Lepcha dinner',
          location: 'Homestay Dining Hall',
          notes: 'Try local Gundruk soup and Momos.'
        },
        estimatedCostINR: 2200,
        recommendedHomestay: {
          id: 'home-mountain-view-sitong',
          name: 'Kanchenjunga Bliss Eco Homestay',
          village: 'Sitong Village',
          pricePerNightINR: 1500
        },
        recommendedTaxi: {
          route: 'Bagdogra to Sitong / Darjeeling',
          vehicleType: 'Bolero / Innova SUV',
          estimatedFareINR: 2800
        },
        localTips: [
          'Carry cash as digital network may fluctuate in upper valleys.',
          'Always ask homestay hosts for recommended local trekking trails.'
        ]
      })),
      totalEstimatedCostINR: daysCount * 3200,
      packingList: [
        'Layered warm fleece jackets and thermal innerwear',
        'Sturdy walking shoes with anti-slip grip',
        'Personal refillable water bottle',
        'Power bank for mountain photography',
        'Government ID proofs (Voter ID / Aadhaar / Passport) for permits'
      ],
      safetyTips: [
        'Pace yourself to adjust to higher altitudes.',
        'Always hire verified HillyTrip drivers for mountain hairpins.'
      ],
      bestLocalFoodToTry: [
        'Steamed Darjeeling Momos with fiery Dalle Achar',
        'Thukpa (Noodle Soup)',
        'Traditional Churpee cheese snack',
        'Fermented Gundruk soup with steamed rice'
      ],
      createdAt: new Date().toISOString()
    };
  }
}
