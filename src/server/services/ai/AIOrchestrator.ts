import { AIGatewayRequest, AIGatewayResponse } from '../../../types/aiPlatform';
import { AIGateway } from './AIGateway';
import { KnowledgeService } from './KnowledgeService';
import { PromptService } from './PromptService';
import { ProviderFactory } from './providers/ProviderFactory';

export class AIOrchestrator {
  public static async processRequest<T = any>(request: AIGatewayRequest): Promise<AIGatewayResponse<T>> {
    // 1. Retrieve Knowledge Context (RAG grounding)
    const knowledge = KnowledgeService.getKnowledgeContext(request.prompt);

    // 2. Load System Prompt template if available
    let systemInstruction = request.systemContext || '';
    const promptTemplate = PromptService.getPrompt(request.requestType);
    if (promptTemplate) {
      systemInstruction = `${promptTemplate.templateText}\n\n[VERIFIED HILLYTRIP PLATFORM DATA]\n${knowledge.contextText}`;
    } else if (knowledge.contextText) {
      systemInstruction += `\n\n[VERIFIED HILLYTRIP PLATFORM DATA]\n${knowledge.contextText}`;
    }

    // 3. Delegate to AIGateway
    const response = await AIGateway.executeRequest<T>(request, async (providerType) => {
      const provider = ProviderFactory.getProvider(providerType);
      const isJsonRequest = Boolean(request.parameters?.responseJsonSchema);

      const completion = await provider.generateCompletion(request.prompt, {
        systemInstruction,
        temperature: request.temperature ?? 0.7,
        responseJsonSchema: isJsonRequest
      });

      let structuredData: T | undefined = undefined;
      if (isJsonRequest) {
        try {
          structuredData = JSON.parse(completion.text) as T;
        } catch (e) {
          console.warn('[AIOrchestrator] Could not parse completion as JSON:', completion.text);
        }
      }

      return {
        text: completion.text,
        structuredData,
        inputTokens: completion.inputTokens,
        outputTokens: completion.outputTokens,
        modelUsed: completion.modelUsed
      };
    });

    response.knowledgeSourcesUsed = knowledge.citations;
    return response;
  }
}
