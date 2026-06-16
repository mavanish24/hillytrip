import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

let dynamicAiClient: GoogleGenAI | null = null;
let currentMode: "api_key" | "vertex" = "api_key";

function createClientForMode(mode: "api_key" | "vertex"): GoogleGenAI {
  if (mode === "vertex") {
    let projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
    if (!projectId) {
      try {
        const configPath = path.join(process.cwd(), "firebase-applet-config.json");
        if (fs.existsSync(configPath)) {
          const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
          projectId = config.projectId;
        }
      } catch (e) {
        // quiet fallback
      }
    }
    console.log(`[Gemini client] Initializing with Vertex AI mode. Project ID: ${projectId || "hillytrip-prod"}`);
    return new GoogleGenAI({
      vertexai: true,
      project: projectId || "hillytrip-prod",
      location: "us-central1", // general robust default
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } else {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "" || apiKey === "undefined") {
      // If of any reason the API key is completely missing, default to vertex
      console.warn("[Gemini client] GEMINI_API_KEY is missing or invalid. Defaulting to Vertex AI.");
      currentMode = "vertex";
      return createClientForMode("vertex");
    }

    console.log(`[Gemini client] Initializing with Gemini Developer API key...`);
    if (apiKey.startsWith("AIzaSy") || apiKey.startsWith("AQ.")) {
      return new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } else {
      // It's an access token (e.g. starts with ya29.) instead of a standard api key.
      return new GoogleGenAI({
        httpOptions: {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
}

/**
 * Execute a model generation with security failover to Vertex AI
 * if the project or organization's policies block the API Key service.
 */
export async function executeGeminiOperation<T>(
  operation: (ai: GoogleGenAI) => Promise<T>
): Promise<T> {
  if (!dynamicAiClient) {
    dynamicAiClient = createClientForMode(currentMode);
  }

  try {
    return await operation(dynamicAiClient);
  } catch (err: any) {
    const errorString = String(err?.message || err?.error?.message || err || "");
    const isProblematic =
      errorString.includes("401") ||
      errorString.includes("429") ||
      errorString.includes("403") ||
      errorString.includes("UNAUTHENTICATED") ||
      errorString.includes("RESOURCE_EXHAUSTED") ||
      errorString.includes("Quota exceeded") ||
      errorString.includes("API_KEY_SERVICE_BLOCKED") ||
      errorString.includes("API keys are not supported");

    if (isProblematic) {
      if (currentMode === "api_key") {
        console.log(
          `[Gemini Client Failover] Dynamic failover triggered from API Key mode...`
        );
        try {
          const vertexClient = createClientForMode("vertex");
          const result = await operation(vertexClient);
          // Only switch global mode if it genuinely succeeded
          currentMode = "vertex";
          dynamicAiClient = vertexClient;
          return result;
        } catch (vertexErr: any) {
          console.log(`[Gemini Client Failover] Vertex AI fallback was unavailable. Sticking with original Developer API Key handler.`);
        }
      } else {
        console.log(
          `[Gemini Client Failover] Dynamic failover triggered from Vertex AI mode...`
        );
        try {
          const apiKeyClient = createClientForMode("api_key");
          const result = await operation(apiKeyClient);
          // Only switch global mode if it genuinely succeeded
          currentMode = "api_key";
          dynamicAiClient = apiKeyClient;
          return result;
        } catch (apiKeyErr: any) {
          console.log(`[Gemini Client Failover] Developer API Key retry was unavailable. Sticking with original Vertex AI handler.`);
        }
      }
    }
    throw err;
  }
}
