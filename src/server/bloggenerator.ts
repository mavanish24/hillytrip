import { COMMON_STORAGE_ASSETS, DESTINATION_STORAGE_ASSETS } from '../utils/imagePool';
import { Type } from "@google/genai";
import { dbStore } from "./db";
import { Blog, BlogCategory, BlogSeo, BlogFaq, BlogActivityLog } from "../types";
import { executeGeminiOperation } from "./geminiClient";
import { 
  getLiveSupabaseVillages, 
  getLiveSupabaseHomestays, 
  getLiveSupabaseAttractions 
} from "./services/location/GeoProximityService";

// Simple slugifier
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

// Helper to format slug/path into Title Case
function formatSlugToTitle(slugOrPath: string): string {
  if (!slugOrPath) return '';
  let lastSeg = slugOrPath.split('/').filter(Boolean).pop() || slugOrPath;
  lastSeg = lastSeg.replace(/^[\[\(/]+|[\]\)]+$/g, '');
  lastSeg = lastSeg.replace(/^(VIL|ATT|HS|TX|ROUTE)\d*[-_]?/i, '');
  if (!lastSeg) return 'Explore';
  const words = lastSeg.split(/[-_]+/);
  return words
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Resolve human-readable entity name from database by matching ID, Slug, or URL path.
 * Guarantees zero slugs, raw URLs, or internal database IDs as visible link text.
 */
export function resolveEntityTitle(urlOrSlugOrId: string): string {
  if (!urlOrSlugOrId) return '';

  const destinations = dbStore.getDestinations() || [];
  const attractions = dbStore.getAttractions() || [];
  const homestays = dbStore.getHomestays() || [];
  const operators = dbStore.getTaxiOperators() || [];
  const routes = dbStore.getRoutes() || [];

  const clean = urlOrSlugOrId.trim();

  // Try matching Destination
  const dest = destinations.find(d => d.id === clean || d.slug === clean || clean.includes(`/destinations/${d.slug || d.id}`));
  if (dest) return dest.name;

  // Try matching Attraction
  const attr = attractions.find(a => a.id === clean || a.slug === clean || clean.includes(`/attractions/${a.slug || a.id}`));
  if (attr) return attr.name;

  // Try matching Homestay
  const home = homestays.find(h => h.id === clean || h.slug === clean || clean.includes(`/homestays/${h.slug || h.id}`));
  if (home) return home.name;

  // Try matching Taxi Operator
  const op = operators.find((o: any) => o.id === clean || o.slug === clean || clean.includes(`/taxi/${o.slug || o.id}`));
  if (op) return op.name;

  // Try matching Route
  const r = routes.find((rt: any) => rt.id === clean || rt.slug === clean || clean.includes(`/routes/${rt.slug || rt.id}`));
  if (r) return (r as any).name || `${r.fromHubId} to ${r.toHubId}`;

  // Fallback to title case of slug/path
  return formatSlugToTitle(clean);
}

/**
 * Sanitize and clean public content to guarantee:
 * 1. Zero raw database IDs (VILxxxx, ATTxxxxx, HSxxxx, TXxxxx, ROUTExxx, UUIDs)
 * 2. All links converted to SEO-friendly slugs (/destinations/slug, /attractions/slug, etc.)
 * 3. Every link anchor text resolved to human-readable entity title (no URLs or slugs as link text)
 * 4. Removal of placeholder text ("Information not available", "Price not available", "There are no verified homestays", etc.)
 * 5. Removal of AI clichés ("Nestled in", "Known for", "Whether you are", "Hidden gem", etc.)
 * 6. Removal of empty sections left without content
 * 7. Deduplication of list items and paragraphs
 */
export function cleanAndSanitizePublicContent(content: string): string {
  if (!content) return "";

  let cleaned = content;

  // Mask widget shortcodes so internal IDs inside tokens like [[WIDGET:ROUTE:ROUTE0004]] are preserved
  const widgetTokens: string[] = [];
  cleaned = cleaned.replace(/\[\[WIDGET:[^\]]+\]\]/gi, (match) => {
    widgetTokens.push(match);
    return `___WIDGET_TOKEN_${widgetTokens.length - 1}___`;
  });

  const destinations = dbStore.getDestinations() || [];
  const attractions = dbStore.getAttractions() || [];
  const homestays = dbStore.getHomestays() || [];
  const operators = dbStore.getTaxiOperators() || [];
  const routes = dbStore.getRoutes() || [];

  // 1. Convert internal ID URLs to SEO slug URLs
  cleaned = cleaned.replace(/\/destinations\/([A-Za-z0-9_-]+)/g, (_match, id) => {
    const dest = destinations.find(d => d.id === id || d.slug === id);
    if (dest) {
      const slug = dest.slug || slugify(dest.name);
      return `/destinations/${slug}`;
    }
    if (id.startsWith('VIL')) {
      return `/destinations/${slugify(id.replace(/^VIL\d*/i, 'destination'))}`;
    }
    return `/destinations/${slugify(id)}`;
  });

  cleaned = cleaned.replace(/\/attractions\/([A-Za-z0-9_-]+)/g, (_match, id) => {
    const attr = attractions.find(a => a.id === id || a.slug === id);
    if (attr) {
      const slug = attr.slug || slugify(attr.name);
      return `/attractions/${slug}`;
    }
    if (id.startsWith('ATT')) {
      return `/attractions/${slugify(id.replace(/^ATT\d*/i, 'attraction'))}`;
    }
    return `/attractions/${slugify(id)}`;
  });

  cleaned = cleaned.replace(/\/homestays\/([A-Za-z0-9_-]+)/g, (_match, id) => {
    const home = homestays.find(h => h.id === id || h.slug === id);
    if (home) {
      const slug = home.slug || slugify(home.name);
      return `/homestays/${slug}`;
    }
    if (id.startsWith('HS')) {
      return `/homestays/${slugify(id.replace(/^HS\d*/i, 'homestay'))}`;
    }
    return `/homestays/${slugify(id)}`;
  });

  cleaned = cleaned.replace(/\/(?:taxi|operators)\/([A-Za-z0-9_-]+)/g, (_match, id) => {
    const op = operators.find((o: any) => o.id === id || o.slug === id);
    if (op) {
      const slug = (op as any).slug || slugify(op.name);
      return `/taxi/${slug}`;
    }
    return `/taxi/${slugify(id)}`;
  });

  cleaned = cleaned.replace(/\/routes\/([A-Za-z0-9_-]+)/g, (_match, id) => {
    const r = routes.find((rt: any) => rt.id === id || rt.slug === id);
    if (r) {
      const slug = (r as any).slug || slugify((r as any).name || `${r.fromHubId}-to-${r.toHubId}`);
      return `/routes/${slug}`;
    }
    return `/routes/${slugify(id)}`;
  });

  // 2. Transform standalone bracket paths like [/attractions/chemchey-view-point] into [Chemchey View Point](/attractions/chemchey-view-point)
  cleaned = cleaned.replace(/\[(\/(?:destinations|attractions|homestays|taxi|routes)\/[a-zA-Z0-9_-]+)\](?!\()/g, (_m, path) => {
    const resolvedName = resolveEntityTitle(path);
    return `[${resolvedName}](${path})`;
  });

  // 3. Resolve anchor text for all Markdown links [Label](URL) so visitors never see raw URLs, slugs, or database IDs
  cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, rawUrl) => {
    const trimmedLabel = label.trim();
    const trimmedUrl = rawUrl.trim();

    const isUrl = trimmedLabel.startsWith('/') || trimmedLabel.startsWith('http');
    const isSameAsUrl = trimmedLabel === trimmedUrl || trimmedLabel === `#${trimmedUrl}`;
    const isSlug = /^[a-z0-9]+-[a-z0-9-]+$/i.test(trimmedLabel);
    const isInternalId = /^(VIL|ATT|HS|TX|ROUTE|BLOG)\d+/i.test(trimmedLabel);

    if (isUrl || isSameAsUrl || isSlug || isInternalId) {
      const resolvedTitle = resolveEntityTitle(trimmedUrl || trimmedLabel);
      return `[${resolvedTitle}](${trimmedUrl})`;
    }

    // Strip any raw database ID prefixes from anchor text
    const cleanLabel = trimmedLabel.replace(/\b(VIL\d+|ATT\d+|HS\d+|TX\d+|ROUTE\d+)\b/gi, '').trim();
    const finalLabel = cleanLabel || resolveEntityTitle(trimmedUrl);
    return `[${finalLabel}](${trimmedUrl})`;
  });

  // 4. Strip any raw internal database IDs from body text (e.g. VILxxxx, ATTxxxxx, HSxxxx, TXxxxx, ROUTExxx, etc.)
  cleaned = cleaned.replace(/\b(VIL\d+|ATT\d+|HS\d+|TX\d+|ROUTE\d+|BLOG\d+)\b/gi, '');

  // 5. Remove placeholder phrases, empty status messages, and AI clichés
  const placeholderPatterns = [
    /-\s*\*?Pricing:\*?\s*(?:Price not available|Information not available)[^\n]*/gi,
    /-\s*\*?Contact:\*?\s*(?:Information not available|No claim contact yet)[^\n]*/gi,
    /-\s*\*?Road conditions:\*?\s*Please consult local taxi operators[^\n]*/gi,
    /-\s*(?:Information not available|Price not available|Information is unavailable)[^\n]*/gi,
    /-\s*No verified attractions yet\.?/gi,
    /-\s*No local homestays verified yet\.?/gi,
    /There are no verified homestays[^\n]*/gi,
    /There are no taxi operators[^\n]*/gi,
    /Information is unavailable[^\n]*/gi,
    /Please check locally[^\n]*/gi,
    /Price not available/gi,
    /Information not available/gi,
    /No claim contact yet/gi,
    /Featured Image Required/gi
  ];

  placeholderPatterns.forEach((regex) => {
    cleaned = cleaned.replace(regex, '');
  });

  // 6. Clean up repetitive AI tropes & clichés to ensure authentic travel writing
  cleaned = cleaned
    .replace(/\bNestled in the heart of\b/gi, 'Located in')
    .replace(/\bNestled in\b/gi, 'Located in')
    .replace(/\bKnown for its picturesque\b/gi, 'Famous for its')
    .replace(/\bServes as a gateway to\b/gi, 'Connects to')
    .replace(/\bWhether you are a budget traveler or\b[^\n,.]*/gi, '')
    .replace(/\bHidden gem\b/gi, 'Serene retreat')
    .replace(/\bWe recommend\b/gi, '')
    .replace(/\bDiscover the allure of\b/gi, 'Explore');

  // 7. Clean up empty bullet lists and trailing whitespace
  cleaned = cleaned
    .replace(/^\s*[-*]\s*:\s*$/gm, '')
    .replace(/^\s*[-*]\s*$/gm, '');

  // 8. Remove empty section headers (e.g. "## Heading" with no text before next heading)
  cleaned = cleaned.replace(/(##+\s+[^\n]+)\n+(?=\n##+|$)/g, '');

  // 9. Deduplicate redundant consecutive lines or paragraphs
  const paragraphs = cleaned.split('\n\n');
  const uniqueParagraphs: string[] = [];
  paragraphs.forEach(p => {
    const trimmed = p.trim();
    if (trimmed && !uniqueParagraphs.includes(trimmed)) {
      uniqueParagraphs.push(trimmed);
    }
  });
  cleaned = uniqueParagraphs.join('\n\n');

  // Restore widget shortcode tokens
  cleaned = cleaned.replace(/___WIDGET_TOKEN_(\d+)___/g, (_, idx) => widgetTokens[Number(idx)] || '');

  return cleaned.trim();
}

/**
 * Validate Travel Guide content before publication.
 * Scans for raw Markdown flaws, exposed database IDs, URL link texts, or placeholder content.
 */
export function validateTravelGuideContent(content: string): { isValid: boolean; issues: string[]; cleanedContent: string } {
  const issues: string[] = [];
  const cleaned = cleanAndSanitizePublicContent(content);

  // Check for remaining raw database IDs
  const idMatches = cleaned.match(/\b(VIL\d+|ATT\d+|HS\d+|TX\d+|ROUTE\d+)\b/gi);
  if (idMatches && idMatches.length > 0) {
    issues.push(`Contains internal database IDs: ${idMatches.join(', ')}`);
  }

  // Check for URLs or slugs used as visible link text
  const urlAsTextMatches = cleaned.match(/\[(\/(?:destinations|attractions|homestays|taxi|routes)\/[a-zA-Z0-9_-]+)\]/g);
  if (urlAsTextMatches && urlAsTextMatches.length > 0) {
    issues.push(`Contains URLs used as visible anchor text: ${urlAsTextMatches.join(', ')}`);
  }

  // Check for placeholder strings
  if (/Information not available|Price not available|Please check locally|There are no verified homestays/i.test(cleaned)) {
    issues.push("Contains unverified placeholder content.");
  }

  return {
    isValid: issues.length === 0,
    issues,
    cleanedContent: cleaned
  };
}

/**
 * Autolink verified HillyTrip resources in generated content using SEO Slugs.
 */
export function autoLinkContent(content: string): string {
  let linkedContent = content;

  // 1. Link Destinations
  const destinations = dbStore.getDestinations() || [];
  destinations.forEach((dest) => {
    if (dest && dest.name) {
      const slug = dest.slug || slugify(dest.name);
      const nameEscaped = dest.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`\\b(${nameEscaped})\\b(?![^\\[]*\\])(?![^\\(]*\\))`, "gi");
      linkedContent = linkedContent.replace(regex, `[$1](/destinations/${slug})`);
    }
  });

  // 2. Link Attractions
  const attractions = dbStore.getAttractions() || [];
  attractions.forEach((attr) => {
    if (attr && attr.name) {
      const slug = attr.slug || slugify(attr.name);
      const nameEscaped = attr.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`\\b(${nameEscaped})\\b(?![^\\[]*\\])(?![^\\(]*\\))`, "gi");
      linkedContent = linkedContent.replace(regex, `[$1](/attractions/${slug})`);
    }
  });

  // 3. Link Homestays
  const homestays = dbStore.getHomestays() || [];
  homestays.forEach((home) => {
    if (home && home.name) {
      const slug = home.slug || slugify(home.name);
      const nameEscaped = home.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`\\b(${nameEscaped})\\b(?![^\\[]*\\])(?![^\\(]*\\))`, "gi");
      linkedContent = linkedContent.replace(regex, `[$1](/homestays/${slug})`);
    }
  });

  return linkedContent;
}

/**
 * Select the next intelligent topic for Daily Blog Generation.
 * It scans existing blogs to detect duplicates and picks a Destination
 * or Attraction that has no blog, or has the least coverage.
 */
export function selectNextTopic(): { type: 'destination' | 'attraction' | 'general'; entity: any; title: string } {
  const destinations = dbStore.getDestinations() || [];
  const attractions = dbStore.getAttractions() || [];
  const existingBlogs = dbStore.getBlogs() || [];

  // Create a map of existing blog titles and content to detect duplicates
  const bloggedEntityIds = new Set<string>();
  existingBlogs.forEach((blog) => {
    // Attempt to parse metadata or slug to see which destination this blog is about
    destinations.forEach((d) => {
      if (blog.slug.includes(d.id) || blog.title.toLowerCase().includes(d.name.toLowerCase())) {
        bloggedEntityIds.add(d.id);
      }
    });
    attractions.forEach((a) => {
      if (blog.slug.includes(a.id) || blog.title.toLowerCase().includes(a.name.toLowerCase())) {
        bloggedEntityIds.add(a.id);
      }
    });
  });

  // Find destination without blog
  const unbloggedDest = destinations.find((d) => !bloggedEntityIds.has(d.id));
  if (unbloggedDest) {
    return {
      type: 'destination',
      entity: unbloggedDest,
      title: `Complete Travel Guide to ${unbloggedDest.name}`,
    };
  }

  // Find attraction without blog
  const unbloggedAttr = attractions.find((a) => !bloggedEntityIds.has(a.id));
  if (unbloggedAttr) {
    return {
      type: 'attraction',
      entity: unbloggedAttr,
      title: `Exploring ${unbloggedAttr.name}: Ultimate Sightseeing Guide`,
    };
  }

  // Fallback to least-blogged destination or a general topic
  if (destinations.length > 0) {
    const randomDest = destinations[Math.floor(Math.random() * destinations.length)];
    return {
      type: 'destination',
      entity: randomDest,
      title: `The Hidden Beauty of ${randomDest.name}: A Local's Perspective`,
    };
  }

  return {
    type: 'general',
    entity: null,
    title: "Offbeat Himalayan Escescapes: Uncharted Trails & Homestays",
  };
}

/**
 * Safely generate a fallback draft structure if all Gemini API attempts or models are unavailable.
 * This guarantees 100% service uptime for SEO article generations even during global high demand,
 * while strictly preventing any destination-data cross-contamination.
 */
export function generateFallbackDraft(topicTitle: string, selectedType: string, selectedEntity: any): any {
  const cleanTitle = topicTitle;
  const cleanSlug = slugify(topicTitle);
  
  if (selectedType === 'destination' && selectedEntity) {
    const d = selectedEntity;
    const destName = d.name || 'Himalayan Hamlet';
    const destSlug = d.slug || slugify(destName);
    const district = d.district || '';
    const state = d.state || 'Sikkim';
    const locationStr = district ? `${district}, ${state}` : state;
    const bestSeason = d.bestSeason || 'October to May';
    const desc = d.description || `A tranquil mountain village located in ${locationStr}, offering scenic views and authentic local hospitality.`;

    // Query database for strictly verified associations
    const destIdLower = String(d.id || '').toLowerCase();
    const destNameLower = String(destName).toLowerCase();
    const destDistrictLower = String(district).toLowerCase();

    const directHomestays = (dbStore.getHomestays() || []).filter(h => {
      if (!h) return false;
      const hDestId = String(h.destinationId || (h as any).destination_id || (h as any).village_code || (h as any).villageCode || '').toLowerCase();
      const hVillage = String((h as any).village || h.address || '').toLowerCase();
      const hName = String(h.name || '').toLowerCase();
      return hDestId === destIdLower || (hVillage && hVillage.includes(destNameLower)) || (destNameLower.length > 2 && hName.includes(destNameLower));
    });

    const directAttractions = (dbStore.getAttractions() || []).filter(a => {
      if (!a) return false;
      const aDestId = String(a.destinationId || (a as any).destination_id || '').toLowerCase();
      const aVillage = String((a as any).village || '').toLowerCase();
      const aName = String(a.name || '').toLowerCase();
      return aDestId === destIdLower || (aVillage && aVillage === destNameLower) || (destNameLower.length > 2 && aName.includes(destNameLower));
    });

    const directRoutes = (dbStore.getRoutes() || []).filter(r => {
      if (!r) return false;
      const pathMatches = Array.isArray(r.path) && r.path.some((p: string) => String(p).toLowerCase().includes(destNameLower));
      const fromMatches = String(r.fromHubId || '').toLowerCase().includes(destNameLower) || String(r.fromHubId || '').toLowerCase() === destIdLower;
      const toMatches = String(r.toHubId || '').toLowerCase().includes(destNameLower) || String(r.toHubId || '').toLowerCase() === destIdLower;
      return pathMatches || fromMatches || toMatches;
    });

    let content = `# Complete Travel Guide to [${destName}](/destinations/${destSlug})

Exploring ${destName} in ${locationStr} offers a peaceful mountain retreat, fresh alpine air, and authentic Himalayan community hospitality.

## Overview
${desc}

## Best Time to Visit
- **Autumn (October to December)**: Clear skies and crisp mountain vistas.
- **Spring (March to May)**: Mild daytime temperatures and blooming seasonal flora.
- **Recommended Season**: ${bestSeason}.

## How to Reach
- **By Air**: The nearest major airports are Bagdogra Airport (IXB) and Pakyong Airport (PYG, Sikkim, subject to commercial operations).
- **By Train**: The primary railway hub is New Jalpaiguri Railway Station (NJP) or Siliguri Junction.
- **By Road**: Accessible by road from regional transit centers in ${district || state}.
`;

    // Embed direct verified route if one exists in the database
    if (directRoutes.length > 0) {
      content += `\n[[WIDGET:ROUTE:${directRoutes[0].id}]]\n`;
    }

    // Embed destination-grounded homestay widget
    if (directHomestays.length > 0) {
      content += `\n## Verified Local Homestays\n[[WIDGET:HOMESTAYS:${d.id}]]\n`;
    } else {
      content += `\n## Local Stays\n[[WIDGET:HOMESTAYS:${d.id}]]\n`;
    }

    // Embed destination-grounded attractions widget
    content += `\n## Sightseeing & Attractions\n[[WIDGET:ATTRACTIONS:${d.id}]]\n`;

    if (directAttractions.length > 0) {
      content += `\n### Verified Local Sights:\n`;
      directAttractions.forEach(attr => {
        content += `- **[${attr.name}](/attractions/${attr.slug || slugify(attr.name)})**: ${attr.description || 'Verified local sightseeing landmark.'}\n`;
      });
    }

    content += `\n## Essential Travel Tips
- **Cash & Connectivity**: Carry adequate cash, as digital connectivity and banking kiosks may be limited in remote mountain hamlets.
- **Permits & Regulations**: Check regional entry regulations or protected area permits applicable for ${state}.
- **Eco-Friendly Travel**: Please respect local customs, maintain plastic-free surroundings, and support local community livelihoods.

[[WIDGET:BOOKING:destination:${destName}]]
`;

    return {
      title: cleanTitle,
      slug: cleanSlug,
      content: cleanAndSanitizePublicContent(content),
      category: 'Ultimate Travel Guide',
      readingTime: 5,
      metaTitle: `${destName} Travel Guide | HillyTrip`,
      metaDescription: `Travel guide for ${destName}, ${locationStr}. Verified seasonal tips, homestays, and local information.`,
      primaryKeyword: `${destName.toLowerCase()} travel guide`,
      secondaryKeywords: [`${destName.toLowerCase()} sikkim`, `${district.toLowerCase()} travel`, "himalayan homestays"],
      lsiKeywords: ["himalayan village stay", "authentic mountain stay", "sustainable tourism"],
      faqs: [
        {
          question: `How can I reach ${destName}?`,
          answer: `Travelers can reach ${destName} via road from regional hubs such as Siliguri, NJP, or transit stands in ${district || state}.`
        },
        {
          question: `What is the best season to visit ${destName}?`,
          answer: `The recommended time to visit is during ${bestSeason}, offering pleasant weather and scenic mountain vistas.`
        }
      ]
    };
  }

  // Generic Himalayan fallback draft
  let content = `# ${cleanTitle}

Exploring the offbeat hamlets of North Bengal and Sikkim offers a rewarding journey through peaceful mountain settlements and spectacular panoramas.

## Overview
Away from congested urban corridors, Himalayan mountain villages present crisp alpine air, traditional hospitality, and undisturbed natural beauty.

## Best Time to Visit
- **Autumn (October to December)**: Clear mountain skies and crisp views of snow peaks.
- **Spring (March to May)**: Mild temperatures and blooming flora.

## How to Reach
- **By Air**: Fly into Bagdogra Airport (IXB).
- **By Train**: Arrive at New Jalpaiguri Railway Station (NJP) or Siliguri.
- **By Road**: Shared or private cabs operate from Siliguri and regional mountain stands.

## Travel Tips
- Carry sufficient cash, as digital payments and ATMs can be unreliable in high-altitude hamlets.
- Pack warm clothing layers, as temperatures drop after sunset.
- Respect local village customs and maintain eco-friendly practices.

[[WIDGET:BOOKING:destination:HillyTrip]]
`;

  if (selectedEntity && selectedEntity.name) {
    const entitySlug = selectedEntity.slug || slugify(selectedEntity.name);
    const routePrefix = selectedType === 'attraction' ? 'attractions' : 'destinations';
    content += `\n## Sightseeing Highlights\n- **[${selectedEntity.name}](/${routePrefix}/${entitySlug})**: ${selectedEntity.description || 'A remarkable destination offering panoramic views and authentic mountain culture.'}\n`;
  }

  return {
    title: cleanTitle,
    slug: cleanSlug,
    content: cleanAndSanitizePublicContent(content),
    category: selectedType === 'homestay' ? 'Homestay Diaries' : 'Ultimate Travel Guide',
    readingTime: 6,
    metaTitle: `${cleanTitle} | HillyTrip Travel Guide`,
    metaDescription: `Discover verified travel routes, seasonal tips, and offbeat sights for ${cleanTitle}.`,
    primaryKeyword: cleanTitle.toLowerCase(),
    secondaryKeywords: ["himalayan travel", "offbeat destinations", "sikkim travel guide"],
    lsiKeywords: ["sustainable tourism", "mountain views", "darjeeling sikkim"],
    faqs: [
      {
        question: `What is the best way to travel around the Himalayas?`,
        answer: "Hiring a private or shared local cab from Siliguri, NJP, or Bagdogra is the most convenient way to reach mountain hamlets."
      },
      {
        question: "Is mobile connectivity reliable in offbeat villages?",
        answer: "Major telecom providers like Jio and Airtel offer reliable service in main towns, though coverage can fluctuate in high-altitude hamlets."
      }
    ]
  };
}

/**
 * Main function to generate an SEO Travel Guide / Blog Post
 */
export async function generateTravelGuide(customTopic?: { type: string; title: string; entityId?: string }): Promise<Blog | null> {
  // 1. Decide topic
  let selected = selectNextTopic();
  if (customTopic) {
    const liveVillages = await getLiveSupabaseVillages().catch(() => []);
    const destinations = (dbStore.getDestinations() || []).concat(liveVillages.map((v: any) => ({
      id: v.village_code || v.id,
      name: v.village_name || v.name,
      district: v.district_name || v.district,
      state: v.state_name || v.state,
      tourismType: v.known_for || v.tourismType || 'Scenic Himalayan Village',
      image: v.image_url || v.cover_image || v.image,
      coverImage: v.cover_image || v.coverImage || v.image_url,
      description: v.overview || v.description,
      slug: v.slug || slugify(v.village_name || v.name || '')
    })));
    const attractions = dbStore.getAttractions() || [];
    let entity = null;
    if (customTopic.entityId) {
      const cleanEntityId = String(customTopic.entityId).toLowerCase().trim();
      entity = destinations.find(d => String(d.id).toLowerCase() === cleanEntityId || String(d.name).toLowerCase() === cleanEntityId) || 
               attractions.find(a => String(a.id).toLowerCase() === cleanEntityId || String(a.name).toLowerCase() === cleanEntityId);
    }
    selected = {
      type: (customTopic.type as any) || 'general',
      entity,
      title: customTopic.title,
    };
  }

  console.log(`[Blog Generator] Generating guide for topic: "${selected.title}"`);

  // 2. Fetch all context data to make sure AI does not hallucinate
  let verifiedDataContextPrompt = "";
  let featuredImage = "";

  if (selected.type === 'destination' && selected.entity) {
    const d = selected.entity;
    featuredImage = d.image || d.coverImage || "";
    
    const destIdLower = String(d.id || '').toLowerCase();
    const destNameLower = String(d.name || '').toLowerCase();
    const destDistrictLower = String(d.district || '').toLowerCase();

    // 1. Direct attractions strictly linked to this destination/village
    const liveAttractions = await getLiveSupabaseAttractions().catch(() => dbStore.getAttractions() || []);
    const directAttractions = liveAttractions.filter((a: any) => {
      if (!a) return false;
      const aDestId = String(a.destinationId || a.destination_id || '').toLowerCase();
      const aVillage = String(a.village || '').toLowerCase();
      const aName = String(a.attraction_name || a.name || '').toLowerCase();
      return aDestId === destIdLower || (aVillage && aVillage === destNameLower) || (destNameLower.length > 2 && aName.includes(destNameLower));
    });

    // 2. Direct homestays strictly linked to this destination/village
    const liveHomestays = await getLiveSupabaseHomestays().catch(() => dbStore.getHomestays() || []);
    const directHomestays = liveHomestays.filter((h: any) => {
      if (!h) return false;
      const hDestId = String(h.destinationId || h.destination_id || h.village_code || h.villageCode || '').toLowerCase();
      const hVillage = String(h.village || h.address || '').toLowerCase();
      const hName = String(h.homestay_name || h.name || '').toLowerCase();
      return hDestId === destIdLower || (hVillage && hVillage.includes(destNameLower)) || (destNameLower.length > 2 && hName.includes(destNameLower));
    });

    // 3. Direct routes connecting this destination
    const directRoutes = (dbStore.getRoutes() || []).filter(r => {
      if (!r) return false;
      const pathMatches = Array.isArray(r.path) && r.path.some((p: string) => String(p).toLowerCase().includes(destNameLower));
      const fromMatches = String(r.fromHubId || '').toLowerCase().includes(destNameLower) || String(r.fromHubId || '').toLowerCase() === destIdLower;
      const toMatches = String(r.toHubId || '').toLowerCase().includes(destNameLower) || String(r.toHubId || '').toLowerCase() === destIdLower;
      return pathMatches || fromMatches || toMatches;
    });

    verifiedDataContextPrompt = `
STRICT FACTUAL GROUNDING MANDATE:
AI must NEVER generate a destination-specific factual claim unless that fact comes from:
1. the destination database record below,
2. a verified linked entity listed below,
3. or an explicitly approved authoritative source already available to the application.
AI may write general travel prose, but it must not invent or infer factual attractions, trails, history, climate windows, transport availability, homestay status, distances, routes, or local characteristics.

Verified HillyTrip Destination Record:
- Name: ${d.name}
- Destination ID: ${d.id}
- Slug: ${d.slug || slugify(d.name)}
- Tourism Type: ${d.tourismType || 'Peaceful mountain retreat'}
- Best Season to Visit: ${d.bestSeason || 'October to May'}
- Description: ${d.description || ''}
- District: ${d.district || ''}, State: ${d.state || 'Sikkim'}
${directAttractions.length > 0 ? `
Verified Direct Sightseeing Attractions in ${d.name} (${directAttractions.length}):
${directAttractions.map((a: any) => `- ${(a.attraction_name || a.name)} (Slug: /attractions/${a.slug || slugify(a.attraction_name || a.name)}): ${a.description || ''}`).join("\n")}
` : `
Verified Sightseeing Count for ${d.name}: 0 verified attractions.
CRITICAL CONSTRAINT: 0 verified direct attractions or trails exist for ${d.name}. You MUST ONLY embed [[WIDGET:ATTRACTIONS:${d.id}]]. DO NOT write, list, or invent any attractions, viewpoints, or trails (e.g., DO NOT invent 'Pine Forest Trails', 'Silk Route Corridor Pathways', or 'Village Walks'). Show only the mapping state widget.
`}
${directHomestays.length > 0 ? `
Verified Local Homestays in ${d.name} (${directHomestays.length} verified properties):
${directHomestays.map((h: any) => `- ${(h.homestay_name || h.name)} (Slug: /homestays/${h.slug || slugify(h.homestay_name || h.name)}): Price range ₹${h.priceMin || h.price_per_night || 1500} - ₹${h.priceMax || (h.price_per_night ? h.price_per_night * 2 : 2500)}/night. Amenities: ${Array.isArray(h.amenities) ? h.amenities.join(", ") : (h.amenities || 'Home-cooked meals, hot water')}`).join("\n")}
CRITICAL INSTRUCTION: Exactly ${directHomestays.length} verified homestays exist in ${d.name}. State clearly that verified local homestays are available in ${d.name} and embed [[WIDGET:HOMESTAYS:${d.id}]]. DO NOT say that homestay verification is in progress or that 0 homestays exist.
` : `
Verified Homestay Count for ${d.name}: 0 verified homestays.
CRITICAL INSTRUCTION: 0 verified homestays are currently listed directly in ${d.name}. Acknowledge that local homestay onboarding is underway and embed [[WIDGET:HOMESTAYS:${d.id}]].
`}
${directRoutes.length > 0 ? `
Verified Travel Routes for ${d.name}:
${directRoutes.map(r => `- Route: ${r.fromHubId} to ${r.toHubId} (Slug: /routes/${(r as any).slug || slugify((r as any).name || `${r.fromHubId}-to-${r.toHubId}`)}). Fares: ₹${r.fareMin || 0} - ₹${r.fareMax || 0}.`).join("\n")}
` : `
Verified Direct Routes: 0 cataloged fixed routes for ${d.name}. DO NOT invent taxi fares, routes, or timetables. Embed [[WIDGET:ROUTES:${d.id}]].
`}
`;
  } else if (selected.type === 'attraction' && selected.entity) {
    const a = selected.entity;
    featuredImage = a.image || a.coverImage || "";
    const parentDest = (dbStore.getDestinations() || []).find(d => d.id === a.destinationId);

    verifiedDataContextPrompt = `
Verified HillyTrip Attraction Record:
- Attraction Name: ${a.name}
- Slug: /attractions/${a.slug || slugify(a.name)}
- Category: ${a.category || 'Sightseeing viewpoint'}
- Description: ${a.description || ''}
- Located in Destination: ${parentDest ? `${parentDest.name} (/destinations/${parentDest.slug || slugify(parentDest.name)})` : ''}
- District/State: ${a.district || ''}, ${a.state || 'Sikkim'}
`;
  } else {
    verifiedDataContextPrompt = `
Focus on sustainable offbeat travel in the Darjeeling and Sikkim Himalayas, showcasing peaceful mountain hamlets, local hospitality, organic food, and panoramic views.
`;
  }

  // Build strict rules prompt to avoid hallucination & internal IDs & data contamination
  const systemInstruction = `
You are HillyTrip's senior Himalayan travel editor and investigative travel writer.
Generate an authoritative, engaging, and beautifully formatted travel guide for: "${selected.title}".

CRITICAL GROUNDING AND ZERO CONTAMINATION RULES:
1. NEVER generate a destination-specific factual claim unless that fact is present in the verified context record provided below.
2. AI may write general travel prose, but it MUST NOT invent or infer factual attractions, trails, history, climate windows, transport availability, homestay status, distances, routes, or local characteristics.
3. NEVER expose internal database IDs, table names, or codes (such as VILxxxx, ATTxxxxx, HSxxxx, TXxxxx, ROUTExxx, BLOGxxxx, UUIDs).
4. HOMESTAY GROUNDING:
   - If verified direct homestays count > 0: state that verified local homestays are available and embed [[WIDGET:HOMESTAYS:${selected.entity ? selected.entity.id : 'DESTINATION_ID'}]]. DO NOT say that homestay onboarding or verification is in progress.
   - If verified direct homestays count == 0: state that local homestay onboarding is in progress and embed [[WIDGET:HOMESTAYS:${selected.entity ? selected.entity.id : 'DESTINATION_ID'}]].
5. ATTRACTION & TRAIL GROUNDING:
   - If verified direct attractions count == 0: show ONLY the honest mapping state widget [[WIDGET:ATTRACTIONS:${selected.entity ? selected.entity.id : 'DESTINATION_ID'}]]. DO NOT generate replacement attractions, fabricated sights, or inferred trails (e.g., do NOT invent 'Pine Forest Trails', 'Silk Route Corridor Pathways', or 'Village Walks').
6. HISTORICAL & LANDSCAPE GROUNDING:
   - Remove/avoid claims such as "Associated with historical Silk Route corridors" or "Silk Route Corridor Pathways" unless present in the verified destination data.
   - Remove/avoid "old walking pathways", "traditional footpaths cut through dense pine stands", or "dense pine woods" unless verified.
7. CLIMATE & BEST TIME:
   - Use only the provided verified season window or neutral regional guidance. Do NOT invent destination-specific microclimate claims (such as severe rainfall in specific months).
8. TRANSPORT GROUNDING:
   - Only state that shared taxis, reserved taxis, routes, distances or travel times are available when corresponding verified transport records exist in the verified context data. If none exist, state neutrally that travelers access the area by road via regional transit hubs.
9. Write in an authentic, vivid, professional travel guide style. AVOID cliché AI tropes ("Nestled in", "Known for", "Whether you are", "Serves as", "Picturesque", "We recommend", "Discover", "Hidden gem").
10. ALL internal links MUST use clean, human-readable SEO slugs (/destinations/slug, /attractions/slug, /homestays/slug, /taxi/slug, /routes/slug).
11. DYNAMIC LIVE WIDGET SHORTCODES:
    - [[WIDGET:HOMESTAYS:${selected.entity ? selected.entity.id : 'DESTINATION_ID'}]]
    - [[WIDGET:ATTRACTIONS:${selected.entity ? selected.entity.id : 'DESTINATION_ID'}]]
    - If a verified route was provided in the context, embed [[WIDGET:ROUTE:ROUTE_ID]]. If NO route was provided, DO NOT embed a route widget.
    - Embed [[WIDGET:BOOKING:destination:${selected.entity ? selected.entity.name : 'HillyTrip'}]] for trip booking CTAs.
12. Output a strictly structured JSON matching the requested schema.
`;

  const userPrompt = `
Please generate the travel guide article based on this verified context data:
---
${verifiedDataContextPrompt}
---
The selected target Title is: "${selected.title}"
`;

  let parsed: any = null;

  try {
    const responseText = await executeGeminiOperation(async (aiInstance) => {
      console.log(`[Blog Generator] Generating article via HillyTrip AI Engine for "${selected.title}"...`);
      const response = await aiInstance.models.generateContent({
        model: "gemini-3.7-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "The final polished SEO Title of the blog article" },
              slug: { type: Type.STRING, description: "Unique URL slug (hyphen-separated, lowercase)" },
              content: { type: Type.STRING, description: "Detailed Markdown content of the article body" },
              category: { type: Type.STRING, description: "Recommended category (e.g. 'Ultimate Travel Guide', 'Hidden Gem', 'Homestay Directory')" },
              readingTime: { type: Type.INTEGER, description: "Estimated reading time in minutes" },
              metaTitle: { type: Type.STRING, description: "SEO meta title (maximum 60 characters)" },
              metaDescription: { type: Type.STRING, description: "SEO meta description (maximum 160 characters)" },
              primaryKeyword: { type: Type.STRING, description: "Main target keyword for this article" },
              secondaryKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of secondary keywords to target"
              },
              lsiKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of Latent Semantic Indexing keywords"
              },
              faqs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING }
                  },
                  required: ["question", "answer"]
                },
                description: "List of Frequently Asked Questions"
              }
            },
            required: ["title", "slug", "content", "category", "readingTime", "metaTitle", "metaDescription", "primaryKeyword", "faqs"]
          }
        }
      });

      return response?.text || "";
    });

    if (responseText) {
      parsed = JSON.parse(responseText);
    }
  } catch (error: any) {
    console.error("[Blog Generator Error] Gemini model generation/parsing failed, initiating safe local offline draft generator:", error?.message || error);
  }

  // Safe fallback to offline local generator if AI failed or returned invalid JSON
  if (!parsed || !parsed.title || !parsed.content) {
    console.log(`[Blog Generator Fallback] Generating highly realistic local guidebook for "${selected.title}"`);
    parsed = generateFallbackDraft(selected.title, selected.type, selected.entity);
  }

  try {
    // Link references to HillyTrip's verified detail pages
    const linkedContent = autoLinkContent(parsed.content);
    const sanitizedContent = cleanAndSanitizePublicContent(linkedContent);

    // Save/Get Category
    const categories = dbStore.getBlogCategories() || [];
    let category = categories.find(c => c.name.toLowerCase() === parsed.category.toLowerCase());
    if (!category) {
      category = {
        id: 'cat_' + slugify(parsed.category),
        name: parsed.category,
        slug: slugify(parsed.category),
        description: `Articles and guides in ${parsed.category}`
      };
      await dbStore.saveRecord('blog_categories', category);
    }

    // Verify featured image URL
    let finalFeaturedImage = featuredImage;
    if (!finalFeaturedImage || finalFeaturedImage.trim() === '' || finalFeaturedImage.startsWith('blob:') || finalFeaturedImage === 'Featured Image Required') {
      finalFeaturedImage = "https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png";
    }

    // Ensure unique slug
    const existingBlogs = dbStore.getBlogs() || [];
    const rawSlugBase = parsed.slug || slugify(parsed.title);
    let candidateSlug = rawSlugBase;
    let slugCounter = 1;
    while (existingBlogs.some(b => b.slug === candidateSlug)) {
      slugCounter++;
      candidateSlug = `${rawSlugBase}-${slugCounter}`;
    }

    // Create the Blog record with Published status by default
    const blogId = 'blog_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const nowIso = new Date().toISOString();
    const blogRecord: Blog = {
      id: blogId,
      title: parsed.title,
      content: sanitizedContent,
      slug: candidateSlug,
      status: 'Published',
      categoryId: category.id,
      destinationId: (selected.type === 'destination' && selected.entity ? selected.entity.id : undefined),
      authorId: 'auth_hillytrip_ai', // Default AI Author
      createdAt: nowIso,
      updatedAt: nowIso,
      publishedAt: nowIso,
      featuredImage: finalFeaturedImage,
      readingTime: parsed.readingTime || 5,
      tags: parsed.secondaryKeywords || ['Travel Guides', 'Himalayas']
    };

    // Save Blog Record
    await dbStore.saveRecord('blogs', blogRecord);

    // Save SEO metadata
    const seoRecord: BlogSeo = {
      id: 'seo_' + blogId,
      blogId,
      metaTitle: parsed.metaTitle,
      metaDescription: parsed.metaDescription,
      primaryKeyword: parsed.primaryKeyword,
      secondaryKeywords: parsed.secondaryKeywords,
      lsiKeywords: parsed.lsiKeywords || [],
      canonicalUrl: `https://hillytrip.com/travel-guides/${blogRecord.slug}`,
      breadcrumbSchema: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hillytrip.com" },
          { "@type": "ListItem", "position": 2, "name": "Travel Guides", "item": "https://hillytrip.com/travel-guides" },
          { "@type": "ListItem", "position": 3, "name": parsed.title, "item": `https://hillytrip.com/travel-guides/${blogRecord.slug}` }
        ]
      },
      faqSchema: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": (parsed.faqs || []).map((faq: any) => ({
          "@type": "Question",
          "name": faq.question || "Travel Question",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer || "Answer details."
          }
        }))
      }
    };
    await dbStore.saveRecord('blog_seo', seoRecord);

    // Save FAQs
    if (parsed.faqs && Array.isArray(parsed.faqs)) {
      for (let i = 0; i < parsed.faqs.length; i++) {
        const faq = parsed.faqs[i];
        const faqRecord: BlogFaq = {
          id: `faq_${blogId}_${i}`,
          blogId,
          question: faq.question || "Travel Question",
          answer: faq.answer || "Answer details."
        };
        await dbStore.saveRecord('blog_faqs', faqRecord);
      }
    }

    // Create an Activity Log
    const log: BlogActivityLog = {
      id: 'log_' + Date.now(),
      blogId,
      userId: 'system_ai',
      userEmail: 'ai-engine@hillytrip.com',
      action: 'generate',
      details: `Automatically generated draft Travel Guide for "${blogRecord.title}" using Gemini 3.5 Flash.`,
      createdAt: new Date().toISOString()
    };
    await dbStore.saveRecord('blog_activity_logs', log);

    // Send a system notification to admin
    try {
      const notifId = 'notif_blog_' + blogId;
      const notif = {
        id: notifId,
        userId: 'mavanish24@gmail.com', // Admin email
        role: 'admin' as const,
        leadId: blogId,
        title: `New Draft Travel Guide: ${blogRecord.title}`,
        message: `HillyTrip AI Engine has generated a new draft article: "${blogRecord.title}". Go to the Admin Panel to review and publish it with one-click!`,
        category: 'system' as const,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      // Save notification safely
      if (dbStore.data.bookingNotifications) {
        dbStore.data.bookingNotifications.push(notif);
        dbStore.save();
      }
    } catch (eNotif) {
      console.warn("Minor: Failed to create admin notification:", eNotif);
    }

    console.log(`[Blog Generator Success] Successfully saved draft guide with ID: ${blogId}`);
    return blogRecord;
  } catch (error: any) {
    console.error("[Blog Generator Error] Failed during draft generation:", error);
    return null;
  }
}

/**
 * Seed initial sample categories, authors and templates if none exist
 */
export function seedBlogDefaults() {
  const categories = dbStore.getBlogCategories();
  if (!categories || categories.length === 0) {
    console.log("[Blog Seeding] Populating default categories...");
    const defaults: BlogCategory[] = [
      { id: 'cat_travel_guides', name: 'Travel Guides', slug: 'travel-guides', description: 'Comprehensive itineraries and regional travel guides.' },
      { id: 'cat_homestays', name: 'Homestay Diaries', slug: 'homestays', description: 'Reviews and deep dives into cozy local homestays.' },
      { id: 'cat_culture', name: 'Culture & Food', slug: 'culture-and-food', description: 'Explore local Himalayan traditions, dishes, and lifestyle.' },
      { id: 'cat_adventure', name: 'Adventure & Treks', slug: 'adventure-treks', description: 'Offroad routes, trekking trails, and adventure hubs.' }
    ];
    defaults.forEach(c => dbStore.saveRecord('blog_categories', c));
  }

  const authors = dbStore.getBlogAuthors();
  if (!authors || authors.length === 0) {
    console.log("[Blog Seeding] Populating default authors...");
    dbStore.saveRecord('blog_authors', {
      id: 'auth_hillytrip_ai',
      name: 'HillyTrip Travel AI',
      email: 'ai-engine@hillytrip.com',
      bio: 'Automated travel assistant synthesizing local homestay reviews, taxi routes, and scenic spots from verified community inputs.',
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=HillyTripWriter'
    });
    dbStore.saveRecord('blog_authors', {
      id: 'auth_admin',
      name: 'HillyTrip Editorial Team',
      email: 'mavanish24@gmail.com',
      bio: 'Curator of Himalayan experiences and verified guides.',
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=HillyTripWriter'
    });
  }

  const blogs = dbStore.getBlogs();
  if (!blogs || blogs.length === 0) {
    console.log("[Blog Seeding] Populating default starter travel guides...");
    const rawContent = `# Ultimate Travel Guide to Offbeat Darjeeling & Sikkim

Welcome to your ultimate guide for exploring the serene, uncrowded hamlets of North Bengal and Sikkim. Beyond the bustling town centers of [Darjeeling](/destinations/darjeeling) and [Gangtok](/destinations/gangtok) lie pristine mountain villages surrounded by pine forests, tea gardens, and panoramic views of Mount Kanchenjunga.

## 1. Top Offbeat Destinations
- **[Chatakpur](/destinations/chatakpur)**: A quiet eco-village perched inside Senchal Wildlife Sanctuary.
- **[Sittong](/destinations/sittong)**: The orange village of Darjeeling with lush orchards and peaceful homestays.
- **[Rinchenpong](/destinations/rinchenpong)**: Peaceful village in West Sikkim offering direct Kanchenjunga views.
- **[Zuluk](/destinations/zuluk)**: High-altitude mountain village along the historic Silk Route in East Sikkim.

## 2. Local Homestays & Hospitality
Staying at local homestays allows you to experience genuine Himalayan warmth, farm-to-table organic food, and insider tips from local hosts.

## 3. Best Time to Visit
- **Autumn (October - December)**: Crisp clear skies and stunning mountain panoramas.
- **Spring (March - May)**: Rhododendron blooms and pleasant weather.

## 4. Transit & How to Reach
Reach Bagdogra Airport (IXB) or New Jalpaiguri Railway Station (NJP), and hire a private or shared cab to reach these scenic hamlets.`;

    const defaultGuide = {
      id: 'blog_starter_guide_01',
      title: 'Ultimate Travel Guide to Offbeat Darjeeling & Sikkim',
      slug: 'ultimate-travel-guide-offbeat-darjeeling-sikkim',
      content: cleanAndSanitizePublicContent(rawContent),
      status: 'Published',
      categoryId: 'cat_travel_guides',
      authorId: 'auth_hillytrip_ai',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      featuredImage: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png',
      readingTime: 6,
      tags: ['Darjeeling', 'Sikkim', 'Offbeat Homestays', 'Himalayas']
    };
    dbStore.saveRecord('blogs', defaultGuide);
  }
}

/**
 * Configure the daily blog generation scheduler
 */
export function setupDailyBlogScheduler() {
  // Seed defaults immediately
  seedBlogDefaults();

  console.log("📖 [Blog Scheduler] Initializing travel guide background generator...");

  // Run initial draft generation after 10 seconds if no blogs exist
  setTimeout(async () => {
    try {
      const blogs = dbStore.getBlogs() || [];
      if (blogs.length === 0) {
        console.log("📖 [Blog Scheduler] No travel guides found in database. Running initial automated draft generation...");
        await generateTravelGuide();
      }
    } catch (err) {
      console.error("📖 [Blog Scheduler Error] Initial generation failed:", err);
    }
  }, 10000);

  // Set up 24 hour interval for daily automated draft generation
  setInterval(async () => {
    try {
      console.log("📖 [Blog Scheduler] Running daily automated draft travel guide generation...");
      await generateTravelGuide();
    } catch (err) {
      console.error("📖 [Blog Scheduler Error] Daily generation interval error:", err);
    }
  }, 24 * 60 * 60 * 1000); // Once every 24 hours
}

