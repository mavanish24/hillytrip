// Curated Pool of Extremely High-Resolution, Direct-Link, Fully Functional Unsplash Travel Photography
// Specifically chosen for Himalayan, Gorkha, Indian mountain valley, and general hill-region aesthetics.

const CURATED_IMAGES = {
  lake: [
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop"
  ],
  temple: [
    "https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1604999333679-b86d54738315?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1200&auto=format&fit=crop"
  ],
  waterfall: [
    "https://images.unsplash.com/photo-1432406776043-6c76ea02e50f?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1200&auto=format&fit=crop"
  ],
  snow: [
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?q=80&w=1200&auto=format&fit=crop"
  ],
  forest: [
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1200&auto=format&fit=crop"
  ],
  village: [
    "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop"
  ],
  mountain: [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
  ]
};

export function getSmartDirectUnsplashUrl(name: string, description: string, categoryOrType: string): string {
  const cleanName = (name || "").trim();
  const cleanDesc = (description || "").trim();
  const cleanCat = (categoryOrType || "").trim();
  const norm = (cleanName + " " + cleanDesc + " " + cleanCat).toLowerCase();
  
  let key: keyof typeof CURATED_IMAGES = "mountain";
  
  if (norm.includes("lake") || norm.includes("tso") || norm.includes("water") || norm.includes("pond") || norm.includes("pool")) {
    key = "lake";
  } else if (norm.includes("temple") || norm.includes("monastery") || norm.includes("gompa") || norm.includes("stupa") || norm.includes("buddhist") || norm.includes("prayer") || norm.includes("pagoda") || norm.includes("sacred") || norm.includes("shrine")) {
    key = "temple";
  } else if (norm.includes("waterfall") || norm.includes("falls") || norm.includes("river") || norm.includes("stream") || norm.includes("bridge") || norm.includes("gorge")) {
    key = "waterfall";
  } else if (norm.includes("snow") || norm.includes("glacier") || norm.includes("pass") || norm.includes("peak") || norm.includes("summit") || norm.includes("mount")) {
    key = "snow";
  } else if (norm.includes("forest") || norm.includes("pine") || norm.includes("tree") || norm.includes("national park") || norm.includes("sanctuary") || norm.includes("wildlife") || norm.includes("meadow")) {
    key = "forest";
  } else if (norm.includes("town") || norm.includes("bazaar") || norm.includes("street") || norm.includes("palace") || norm.includes("market") || norm.includes("village") || norm.includes("hotel") || norm.includes("station") || norm.includes("homestay") || norm.includes("inn")) {
    key = "village";
  }

  const pool = CURATED_IMAGES[key];
  
  // Stable hash based on item name characters to always return the same photo for the same named item
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % pool.length;
  return pool[index];
}
