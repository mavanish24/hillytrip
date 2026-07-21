import { dbStore } from "./db";
import { Destination, Attraction } from "../types";
import { executeGeminiOperation } from "./geminiClient";
import { getSmartDirectUnsplashUrl } from "../utils/imagePool";


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
    const promptQuery = buildPromptQuery(record, type);
    
    const generatedText = await executeGeminiOperation(async (ai) => {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptQuery,
      });
      return response.text || "";
    });

    // Clean up any enclosing quotes or formatting
    let cleanedText = generatedText.replace(/^["'`]|["'`]$/g, "").trim();
    if (!cleanedText) {
      throw new Error("Received empty prompt from Gemini");
    }
    return cleanedText;
  } catch (err: any) {
    console.log(`[Cover Prompt Service Info] Gemini prompt generation rate-limited or unavailable for ${record.name || record.id}. Gracefully proceeding to local pre-designed photography templates.`);
    throw err;
  }
}

export function getUnsplashFallback(prompt: string): string {
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
  return fallbackUrl;
}

/**
 * Generates a cover image using gemini-2.5-flash-image based on a prompt
 */
export async function generateCoverImage(prompt: string): Promise<string> {
  const phase = process.env.AI_COVER_PHASE ? parseInt(process.env.AI_COVER_PHASE, 10) : 1;

  if (phase === 1) {
    console.log(`[Cover Image Phase 1] Bypassing Gemini Image Generation for prompt: "${prompt}". Returning curated high-resolution Unsplash image.`);
    return getUnsplashFallback(prompt);
  }

  try {
    const base64Data = await executeGeminiOperation(async (ai) => {
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

      let data: string | null = null;
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          data = part.inlineData.data;
          break;
        }
      }
      if (!data) {
        throw new Error("No image data returned from image generation model.");
      }
      return data;
    });

    return `data:image/png;base64,${base64Data}`;
  } catch (err: any) {
    console.log(`[Cover Image Fallback] Gemini image generation rate-limited or unavailable. Bypassing safely to curated Unsplash cover.`);
    return getUnsplashFallback(prompt);
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

  const phase = process.env.AI_COVER_PHASE ? parseInt(process.env.AI_COVER_PHASE, 10) : 1;
  const singleType = type === "destinations" ? "destination" : "attraction";

  if (phase === 1) {
    console.log(`[Cover Prompt Phase 1] Bypassing Gemini API for ${record.id}. Creating static elegant photography template.`);
    const parentContext = type === "attractions" && record.destinationId 
      ? ` located in beautiful ${record.destinationId}` 
      : "";
    record.coverPrompt = `Premium natural travel photography of "${record.name}"${parentContext}, serene Himalayan atmospheric scenery, photorealistic, cinematic sunset colors, high detail tourism catalog cover page.`;
    record.coverStatus = "pending";
    return true;
  }

  try {
    const prompt = await generateCoverPrompt(record, singleType);
    record.coverPrompt = prompt;
    record.coverStatus = "pending";
    return true;
  } catch (err) {
    console.log(`[Cover Prompt Fallback] Gemini prompt generation rate-limited for ${record.id}. Bypassing safely to elegant photography template.`);
    const parentContext = type === "attractions" && record.destinationId 
      ? ` located in beautiful ${record.destinationId}` 
      : "";
    record.coverPrompt = `Premium natural travel photography of "${record.name}"${parentContext}, serene Himalayan atmospheric scenery, photorealistic, cinematic sunset colors, high detail tourism catalog cover page.`;
    record.coverStatus = "pending";
    return true;
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
    console.warn("Bulk prompt generation task failed:", err);
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

  try {
    const textResult = await executeGeminiOperation(async (ai) => {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
      return response.text || "";
    });

    if (textResult) {
      return textResult;
    }
  } catch (err: any) {
    console.warn(`[Travel Advisor Gemini 429/Quota Limit] Falling back to offline regional advice engine for "${name}" due to:`, err.message || err);
  }

  // Atmospheric Offline Regional Heuristics Engine (No Gemini Quota used!)
  if (queryType === "folklore") {
    const traditionalGreetings = ["Tashi Delek!", "Namaste!", "Sewaro!", "Jhulay!"];
    const greeting = traditionalGreetings[Math.abs(name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % traditionalGreetings.length];
    
    return `### 🏔️ Sacred Legends of ${name}
According to the local elders of the hills, **${name}** is not merely a geographic coordinate but a dynamic sanctuary protected by ancient nature spirits. Local Gorkha and Tibetan elders recount that centuries ago, a wandering Mahasiddha (Buddhist saint) spent years meditating at this ${category}${geographicalContext} to pacify the wild winds of the mountain ridges. It is believed that the rustling of the deep pines surrounding this location is actually the whispered prayers of those early guardians, echoing across the valleys.

Another popular legend tells of a mountain snow leopard that was transformed into a guardian spirit to watch over the local organic micro-farms and livestock of the village. To this day, local communities of the region maintain a sacred ritual of silence when passing through its highest point to pay homage to the protective mountain deities.

> **"${greeting}"** May the mountain spirits grant peace to your footsteps, and may the wind carry your burdens far beyond the snow-clad peaks of Kanchenjunga.`;
  } else if (queryType === "itinerary") {
    return `### 🗓️ Curated 2-Day Adventure for ${name} (${category})

#### 🌅 Day 1: Sunrise Ridge Trek & Local Flavors
*   **05:00 AM – Sunrise at ${name}**: Wake up early to catch the gold-washed morning rays creeping over the pine valleys and snowfields. The mist usually clears around this hour, offering crystal clarity.
*   **09:00 AM – Traditional Hillside Breakfast**: Stop by a local wooden homestay nearby. Order steaming hot Momos paired with spicy red cherry pepper (*Dalle Khursani*) chutney, or freshly baked Tibetan breads with local unsalted butter tea.
*   **12:00 PM – Forest Trail Exploration**: Embark on a peaceful trek through the surrounding conifer forests. Keep your eyes peeled for mountain butterflies, wild orchids, and Himalayan birds.
*   **05:00 PM – Sunset Lookout**: Gather at the main scenic clearing. Watch the sky shift from brilliant orange into deep twilight violet.

#### 🌲 Day 2: Culture, Monasteries & Forest Streams
*   **08:00 AM – Sacred Heritage & Etiquette**: Visit the nearest local Buddhist prayer shrine or century-old temple. Remember to always walk clockwise around the prayer wheels and main stupa as a mark of respect.
*   **11:30 AM – Riverside Picnic & Cardamom Lands**: Descend towards the nearest mountain stream pool. Enjoy a serene lunch surrounded by green cardamom fields and refreshing forest air.
*   **03:00 PM – Interacting with Artisans**: Visit the organic farms or wood-carving stalls nearby. Acquire authentic handmade handicrafts directly from the hill artisans to support the local micro-economy.
*   **07:00 PM – Farewell Bonfire**: Cozy up by a safe garden bonfire, sharing travel stories under the pristine starry sky.`;
  } else if (queryType === "packing") {
    return `### 🎒 Packing Checklist & Mountaineering Guide for ${name}

#### 🧥 Technical Clothing & Layers
*   **Thermal Base Layers**: Merino wool or high-quality synthetics to lock in body heat during rapidly freezing mountain nights.
*   **Windproof & Fleece Mid-Layer**: High elevations (up to ${destinationName ? "the surrounding peaks of " + destinationName : "2,200+ meters"}) get incredibly breezy near sunset.
*   **Sturdy Trekking Boots**: Waterproof properties with solid ankle support and deep vibram lugs for walking on muddy, loose gravel paths.

#### 🔋 Electronics & Essentials
*   **High-Capacity Powerbank**: The cold Himalayan mountain air drains lithium phone batteries up to 40% faster than sea level. Keep your batteries in warm inner pockets.
*   **Wide-Angle Camera or Smartphone**: Mandatory for capturing the sheer depth of the pine-fringed valleys.

#### 🌿 Eco-Conscious Travel Gear
*   **Reusable Solid Steel Water Bottle**: Single-use plastic bottles are heavily discouraged or banned entirely in tourist eco-zones here to preserve the forest floor.
*   **Biodegradable Wet Wipes & Toiletries**: Helps minimize the ecological footprint in sensitive alpine envs.
*   **Himalayan First Aid Kit**: Including ginger drops for altitude sickness, rehydration salts, muscle sprays, and basic band-aids.`;
  } else { // "hidden_secrets"
    return `### 🕵️‍♂️ 3 Off-the-Beaten Path Secret Spots near ${name}

1.  **The Whispering Pine Clearing (approx. 1.2 km past ${name})**
    *   **The Magic**: A hidden naturally flat clearing deep inside the conifer forest where the wind creates a beautiful flute-like reverberation. It is a blissful sanctuary for meditation or silent reading.
    *   **How to Find**: Take the narrow dirt footpath branching left behind the local taxi stand, following the moss-painted trees.
    *   **Best Time**: Catch it at 2:30 PM when golden sunbeams pierce the misty conifer canopies at a dramatic 45-degree angle.

2.  **The Old Hermitage Stone Arch (approx. 400m east)**
    *   **The Magic**: Deeply atmospheric ruins of a stone cabin once inhabited by a hermit sage, now reclaimed by wild ferns and purple orchids.
    *   **How to Find**: Walk past the main viewing deck and descend the stone steps trailing the eastern slope.
    *   **Best Time**: 08:00 AM, when soft mountain mist hangs around the archway, providing an ethereal, mystical look.

3.  **The Cardamom Stream Bridge (approx. 2.5 km away)**
    *   **The Magic**: A small wooden suspension bridge connecting organic farms across a rushing mountain brook. It is completely deserted and wild.
    *   **How to Find**: Follow the main jeep road downhill toward the valley basin for 20 minutes.
    *   **Best Time**: 04:30 PM, just before the twilight blue hour wraps the riverbed.`;
  }
}

export function getSmartUnsplashUrl(item: any, type: "destinations" | "attractions"): string {
  const name = item.name || "";
  const categoryOrType = type === "destinations" 
    ? (item.tourismType || "scenery") 
    : (item.category || "sightseeing");
  
  return getSmartDirectUnsplashUrl(name, item.description || "", categoryOrType);
}

export async function bulkApplyUnsplashCovers(overwrite: boolean = false): Promise<{ success: boolean; destinationsUpdated: number; attractionsUpdated: number }> {
  try {
    const dests = dbStore.getDestinations() as any[];
    const attrs = dbStore.getAttractions() as any[];

    let destsUpdated = 0;
    let attrsUpdated = 0;

    const finalDests = dests.map(d => {
      const hasCover = d.coverImage && d.coverImage.trim() !== "";
      const isManual = d.coverStatus === "manual";
      if (isManual) return d;
      
      if (!hasCover || overwrite) {
        const coverUrl = getSmartUnsplashUrl(d, "destinations");
        destsUpdated++;
        return {
          ...d,
          coverImage: coverUrl,
          coverStatus: "generated",
          coverPrompt: d.coverPrompt || `Premium natural travel photography of "${d.name}", scenic Himalayan atmospheric view.`
        };
      }
      return d;
    });

    const finalAttrs = attrs.map(a => {
      const hasCover = a.coverImage && a.coverImage.trim() !== "";
      const isManual = a.coverStatus === "manual";
      if (isManual) return a;
      
      if (!hasCover || overwrite) {
        const coverUrl = getSmartUnsplashUrl(a, "attractions");
        attrsUpdated++;
        return {
          ...a,
          coverImage: coverUrl,
          coverStatus: "generated",
          coverPrompt: a.coverPrompt || `Premium natural travel photography of "${a.name}", scenic Himalayan atmospheric view.`
        };
      }
      return a;
    });

    if (destsUpdated > 0) {
      dbStore.data.destinations = finalDests;
      await dbStore.saveRecordsBulk("destinations", finalDests);
    }

    if (attrsUpdated > 0) {
      dbStore.data.attractions = finalAttrs;
      await dbStore.saveRecordsBulk("attractions", finalAttrs);
    }

    // Persist to local JSON file
    dbStore.save();

    return {
      success: true,
      destinationsUpdated: destsUpdated,
      attractionsUpdated: attrsUpdated
    };
  } catch (err: any) {
    console.error("Bulk Unsplash cover seeding failed:", err);
    throw err;
  }
}


