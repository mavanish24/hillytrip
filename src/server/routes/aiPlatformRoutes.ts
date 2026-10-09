import { Router } from 'express';
import { TravelAssistantService } from '../services/ai/assistants/TravelAssistantService';
import { ItineraryPlannerService } from '../services/ai/assistants/ItineraryPlannerService';
import { SearchInterpreterService } from '../services/ai/assistants/SearchInterpreterService';
import { ContentAssistantService } from '../services/ai/assistants/ContentAssistantService';
import { BusinessAssistantService } from '../services/ai/assistants/BusinessAssistantService';
import { AdminAssistantService } from '../services/ai/assistants/AdminAssistantService';
import { AIObservabilityService } from '../services/ai/AIObservabilityService';
import { PromptService } from '../services/ai/PromptService';
import { ProviderFactory } from '../services/ai/providers/ProviderFactory';
import { KnowledgeService } from '../services/ai/KnowledgeService';

export const aiPlatformRouter = Router();

// 1. AI Travel Companion / Chat
aiPlatformRouter.post('/chat', async (req, res) => {
  try {
    const { prompt, userId } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    const response = await TravelAssistantService.askTravelCompanion(prompt, userId);
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 2. AI Itinerary Planner
aiPlatformRouter.post('/itinerary', async (req, res) => {
  try {
    const { destination, durationDays, travelerType, season, budgetTotalINR, userId } = req.body;
    const response = await ItineraryPlannerService.generateItinerary({
      destination: destination || 'Darjeeling',
      durationDays: Number(durationDays) || 3,
      travelerType: travelerType || 'family',
      season,
      budgetTotalINR: Number(budgetTotalINR) || undefined,
      userId
    });
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate itinerary' });
  }
});

// 3. Natural Language Search Interpreter
aiPlatformRouter.post('/search-interpret', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    const response = await SearchInterpreterService.interpretSearchQuery(query);
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to interpret search' });
  }
});

// 4. AI Content Assistant for Editors
aiPlatformRouter.post('/content-assist', async (req, res) => {
  try {
    const { contentSnippet, contentType } = req.body;
    if (!contentSnippet) {
      return res.status(400).json({ error: 'Content snippet is required' });
    }
    const response = await ContentAssistantService.assistContentEditor(contentSnippet, contentType);
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Content assistance failed' });
  }
});

// 5. AI Business Assistant for Homestays & Taxis
aiPlatformRouter.post('/business-assist', async (req, res) => {
  try {
    const { businessId, businessName, currentDescription, recentReviews } = req.body;
    const response = await BusinessAssistantService.optimizeListingAndReviews(
      businessId || 'biz-101',
      businessName || 'Scenic Homestay',
      currentDescription || 'Comfortable rooms with mountain view.',
      recentReviews || []
    );
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Business optimization failed' });
  }
});

// 6. AI Admin Assistant & Insights
aiPlatformRouter.get('/admin-insights', async (req, res) => {
  try {
    const response = await AdminAssistantService.generateAdminInsights();
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to load admin insights' });
  }
});

// 7. Observability & Telemetry Analytics
aiPlatformRouter.get('/observability', (req, res) => {
  try {
    const summary = AIObservabilityService.getObservabilitySummary();
    return res.json(summary);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 8. User Feedback Logging
aiPlatformRouter.post('/feedback', (req, res) => {
  try {
    const { requestId, rating, comment, userId } = req.body;
    if (!requestId || !rating) {
      return res.status(400).json({ error: 'requestId and rating are required' });
    }
    const record = AIObservabilityService.logFeedback(requestId, rating, comment, userId);
    return res.json({ status: 'ok', record });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 9. Central Prompt Library Management
aiPlatformRouter.get('/prompts', (req, res) => {
  return res.json(PromptService.getAllPrompts());
});

aiPlatformRouter.put('/prompts/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const { templateText, updatedBy } = req.body;
    const updated = PromptService.updatePrompt(slug, templateText, updatedBy);
    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 10. Provider Models Registry & Config
aiPlatformRouter.get('/providers', (req, res) => {
  return res.json(ProviderFactory.getModelConfigs());
});

aiPlatformRouter.put('/providers/:id', (req, res) => {
  try {
    const { id } = req.params;
    ProviderFactory.updateModelConfig(id, req.body);
    return res.json({ status: 'updated', configs: ProviderFactory.getModelConfigs() });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 11. Knowledge Layer Base Items
aiPlatformRouter.get('/knowledge', (req, res) => {
  return res.json(KnowledgeService.getAllItems());
});
