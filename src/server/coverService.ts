import { GoogleGenAI } from "@google/genai";
import { dbStore } from "./db";
import { Destination, Attraction } from "../types";

// Lazy-initialized Gemini client to prevent issues if GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "" || apiKey === "undefined") {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please configuration your key in 'Settings' (gear icon, top-right) -> 'Secrets'.");
    }
    if (!apiKey.startsWith("AIzaSy") && !apiKey.startsWith("AQ.")) {
      throw new Error("The configured GEMINI_API_KEY format is unexpected. A valid Gemini API key usually starts with 'AIzaSy' or 'AQ.'. Please verify your credentials in Settings -> Secrets.");
    }
    if (apiKey.startsWith("AIzaSy")) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } else {
      // It's an access token (e.g. starts with ya29.) instead of a standard api key.
      aiClient = new GoogleGenAI({
        httpOptions: {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

/**
 * Builds an engineering context for the prompt based on record fields.
 */
function buildPromptQuery(record: any, type: "destination" | "attraction"): string {
  const name = record.name || "";
  const desc = record.description || "";
  
  // Custom or standard fields
  const categoryOrType = type === "destination" 
    ? (record.tourismType || "Hill Station") 
    : (record.category || "Sightseeing Viewpoint");
    
  const tags = Array.isArray(record.tags) ? record.tags.join(", ") : (record.tags || "");
  const district = record.district || "";
  const region = record.region || "";

  // For attractions, look up destination name to provide geographic context
  let destinationContext = "";
  if (type === "attraction" && record.destinationId) {
    const dests = dbStore.getDestinations();
    const parent = dests.find((d: any) => d.id === record.destinationId);
    if (parent) {
      destinationContext = ` located in ${parent.name}`;
    }
  }

  return `You are an expert travel photography art director.
Generate a high-quality, tourism-focused image generation prompt for the following tourist ${type}:
Name: ${name}${destinationContext}
Description: ${desc}
Category/Type: ${categoryOrType}
Tags: ${tags}
District: ${district}
Region: ${region}

Output EXACTLY and ONLY the final, descriptive prompt. Do not include quotes, markdown bold, bullet points, or conversational filler. Your entire output will be used directly as an image generator prompt.

Example of expected output structure:
Premium travel photography of Deolo Hill, Kalimpong, panoramic Himalayan viewpoints, lush green hills, golden hour lighting, realistic tourism website cover image, ultra-detailed, cinematic landscape photography.`;
}

/**
 * Generates a prompt using gemini-3.5-flash
 */
export async function generateCoverPrompt(record: any, type: "destination" | "attraction"): Promise<string> {
  try {
    const ai = getAiClient();
    const promptQuery = buildPromptQuery(record, type);
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptQuery,
    });

    let generatedText = response.text || "";
    // Clean up any enclosing quotes or formatting
    generatedText = generatedText.replace(/^["'`]|["'`]$/g, "").trim();
    if (!generatedText) {
      throw new Error("Received empty prompt from Gemini");
    }
    return generatedText;
  } catch (err: any) {
    console.error(`Error generating cover prompt for ${record.name || record.id}:`, err);
    throw err;
  }
}

/**
 * Generates a cover image using gemini-2.5-flash-image based on a prompt
 */
export async function generateCoverImage(prompt: string): Promise<string> {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: `${prompt}. High resolution 16:9 wallpaper, beautiful tourism website cover, clear clean lighting, high detail, masterpiece.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    let base64Data: string | null = null;
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        base64Data = part.inlineData.data;
        break;
      }
    }

    if (!base64Data) {
      throw new Error("No image data returned from image generation model.");
    }

    return `data:image/png;base64,${base64Data}`;
  } catch (err: any) {
    console.error("Error generating cover image with Gemini:", err);
    
    // Fall back to a beautiful, context-appropriate, high-resolution Himalayan/nature photo from Unsplash
    const norm = (prompt || "").toLowerCase();
    let fallbackUrl = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"; // Default: Himalayan mountain ridge
    
    if (norm.includes("lake") || norm.includes("tso") || norm.includes("water") || norm.includes("pond")) {
      fallbackUrl = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80"; // Scenic forest lake
    } else if (norm.includes("temple") || norm.includes("monastery") || norm.includes("gompa") || norm.includes("stupa") || norm.includes("buddhist") || norm.includes("prayer") || norm.includes("pagoda")) {
      fallbackUrl = "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=1200&q=80"; // Prayer flags with high mountains
    } else if (norm.includes("waterfall") || norm.includes("falls") || norm.includes("river") || norm.includes("stream") || norm.includes("bridge") || norm.includes("gorge")) {
      fallbackUrl = "https://images.unsplash.com/photo-1432406186150-c40d6c07ab18?auto=format&fit=crop&w=1200&q=80"; // Waterfall
    } else if (norm.includes("snow") || norm.includes("glacier") || norm.includes("pass") || norm.includes("peak") || norm.includes("summit") || norm.includes("mount")) {
      fallbackUrl = "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80"; // Snowy peak
    } else if (norm.includes("forest") || norm.includes("pine") || norm.includes("tree") || norm.includes("national park") || norm.includes("sanctuary") || norm.includes("wildlife")) {
      fallbackUrl = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80"; // Path in pine forest
    } else if (norm.includes("town") || norm.includes("bazaar") || norm.includes("street") || norm.includes("palace") || norm.includes("market") || norm.includes("village") || norm.includes("hotel") || norm.includes("station")) {
      fallbackUrl = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"; // Darjeeling/Himalayan mist street
    }
    
    console.log(`Resolved beautiful fallback cover image for prompt keyword match: ${fallbackUrl}`);
    return fallbackUrl;
  }
}

/**
 * Automatically update coverPrompt for a created/updated destination or attraction.
 * Sets status to 'pending' unless it is currently 'manual' or a manual cover exists.
 */
export async function autoGenerateCoverPromptForRecord(record: any, type: "destinations" | "attractions"): Promise<boolean> {
  // Respect manual priorities
  if (record.coverStatus === "manual") {
    return false;
  }

  try {
    const singleType = type === "destinations" ? "destination" : "attraction";
    const prompt = await generateCoverPrompt(record, singleType);
    record.coverPrompt = prompt;
    record.coverStatus = "pending";
    return true;
  } catch (err) {
    console.error(`Automatic cover prompt generation failed for ${record.id}:`, err);
    record.coverStatus = "failed";
    return false;
  }
}

/**
 * Bulk generate prompts only where coverPrompt is missing. Runs safely in batches of 5.
 */
export async function bulkGenerateMissingPrompts(): Promise<{ success: boolean; count: number }> {
  try {
    const dests = dbStore.getDestinations() as any[];
    const attrs = dbStore.getAttractions() as any[];

    const missingDests = dests.filter(d => !d.coverPrompt && d.coverStatus !== "manual");
    const missingAttrs = attrs.filter(a => !a.coverPrompt && a.coverStatus !== "manual");

    const queue: { record: any; type: "destinations" | "attractions" }[] = [];
    
    missingDests.forEach(d => queue.push({ record: d, type: "destinations" }));
    missingAttrs.forEach(a => queue.push({ record: a, type: "attractions" }));

    let successCount = 0;
    const batchSize = 5;

    for (let i = 0; i < queue.length; i += batchSize) {
      const batch = queue.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (item) => {
          const ok = await autoGenerateCoverPromptForRecord(item.record, item.type);
          if (ok) {
            successCount++;
            // Save local memory copy & update Firestore
            await dbStore.updateRecord(item.type, item.record.id, item.record);
          }
        })
      );
      // Small cooldown to respect Gemini API rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return { success: true, count: successCount };
  } catch (err: any) {
    console.error("Bulk prompt generation task failed:", err);
    throw err;
  }
}

/**
 * Ask the free AI Local Travel Advisor for location guides, folklore, custom itineraries, packing guides or secret spots.
 */
export async function askAiTravelGuide(
  name: string,
  category: string,
  description: string,
  queryType: string,
  destinationName?: string
): Promise<string> {
  try {
    const ai = getAiClient();
    let prompt = "";
    const geographicalContext = destinationName ? ` near ${destinationName}` : "";
    
    if (queryType === "folklore") {
      prompt = `You are an elder Gorkha or Himachali/Tibetan storyteller from the Himalayan hills. 
      Share some fascinating, authentic local folklore, ancient mythology, or historical legends about the spot "${name}" (a ${category}${geographicalContext}). 
      Keep the tone highly atmospheric, atmospheric, mystical, and deeply respectful of regional Himalayan traditions.
      Local spot description for reference: "${description}".
      Provide 2 to 3 beautifully written paragraphs, and end with a traditional local proverb or greeting (e.g. Tashi Delek or Namaste) inside a highlighted quote.`;
    } else if (queryType === "itinerary") {
      prompt = `You are a high-end adventure curator in the Himalayas. 
      Design an exciting, custom 2-Day itinerary for visiting "${name}" (${category}${geographicalContext}) for a traveler.
      Local spot description for reference: "${description}".
      Detail optimal timings (e.g., catching sunrise, skipping mid-day heat), local authentic street food recommendations, transport modes, and local etiquette.
      Structure clearly with Day 1 and Day 2 headings and descriptive bullet points. Keep it practical and engaging.`;
    } else if (queryType === "packing") {
      prompt = `You are an expert high-altitude mountaineer and outdoor survival leader. 
      Provide a highly practical packing checklist and preparation guide for travelers visiting "${name}" (${category}${geographicalContext}).
      Local spot description for reference: "${description}".
      Account for altitude, rapid mountain weather shifts, footwear requirements, eco-friendly constraints (e.g., biodegradable toiletries, steel bottles), and physical stamina prep.
      Structure with organized bulleted sections with descriptive subtitles.`;
    } else { // "hidden_secrets"
      prompt = `You are a local Himalayan explorer who charts hidden, quiet, off-the-beaten-path locations. 
      Provide 3 beautiful, lesser-known secret spots, walking tracks, or historic ruins adjacent to "${name}" (${category}${geographicalContext}) that normal tourists completely miss.
      Local spot description for reference: "${description}".
      Briefly elaborate on why each secret spot is magical, how to physically find it, and the best time/angle to capture stunning landscape photographs of it.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    return response.text || "Our local Himalayan advisor is currently meditating. Please try again in a moment.";
  } catch (err: any) {
    console.error("Error in askAiTravelGuide Gemini query:", err);
    throw err;
  }
}

