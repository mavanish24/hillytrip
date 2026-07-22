import * as fs from 'fs';
import * as path from 'path';
import { initialDestinations, initialAttractions } from './src/data/initialData';

// Define Interface matching DB Store for type safety
interface Resource {
  id: string;
  name?: string;
}

// Slugification utility exactly matched with server.ts
function toSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_'-]/g, '')
    .trim()
    .replace(/[\s_']+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generate() {
  console.log('[Sitemap Generator] Starting static sitemap compilation...');
  
  let destinations: Resource[] = [];
  let attractions: Resource[] = [];
  let homestays: Resource[] = [];
  let routes: Resource[] = [];

  const dbPath = path.join(process.cwd(), 'hillytrip_db_store.json');

  try {
    // 1. File existence check
    if (fs.existsSync(dbPath)) {
      const dbDataRaw = fs.readFileSync(dbPath, 'utf-8').trim();
      
      // 2. Empty-file check
      if (dbDataRaw.length > 0) {
        // 3. Try/catch guarded JSON parsing
        try {
          const dbData = JSON.parse(dbDataRaw);
          destinations = dbData.destinations || [];
          attractions = dbData.attractions || [];
          homestays = dbData.homestays || [];
          routes = dbData.routes || [];
          console.log(`[Sitemap Generator] Successfully parsed DB store. Loaded ${destinations.length} destinations, ${attractions.length} attractions.`);
        } catch (parseError) {
          console.error('[Sitemap Generator] Error: Failed to parse JSON from DB store. Using fallback.', parseError);
        }
      } else {
        console.warn('[Sitemap Generator] Warning: DB store file is empty. Using fallback.');
      }
    } else {
      console.warn(`[Sitemap Generator] Warning: DB store file not found at ${dbPath}. Using fallback.`);
    }
  } catch (fsError) {
    console.error('[Sitemap Generator] Direct filesystem read/access error:', fsError);
  }

  // 4. Fallback generation if data is missing or empty
  if (destinations.length === 0) {
    try {
      console.log('[Sitemap Generator] Activating sitemap fallback from initialData...');
      destinations = initialDestinations || [];
      attractions = initialAttractions || [];
    } catch (fallbackError) {
      console.error('[Sitemap Generator] Extreme fallback failure. Resorting to hardcoded defaults.', fallbackError);
      destinations = [
        { id: 'Darjeeling' },
        { id: 'Kalimpong' },
        { id: 'Gangtok' },
        { id: 'Kurseong' },
        { id: 'Mirik' }
      ];
      attractions = [
        { id: 'tiger-hill' },
        { id: 'mirik-lake' },
        { id: 'delo-park' },
        { id: 'lava-monastery' }
      ];
    }
  }

  try {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Static Pages
    const basePaths = [
      '',
      '/destinations',
      '/attractions',
      '/homestays',
      '/hidden-gems',
      '/plan-my-trip',
      '/book-car',
      '/contribute',
      '/offline-center',
      '/feedback'
    ];

    basePaths.forEach(p => {
      xml += `  <url>\n`;
      xml += `    <loc>https://hillytrip.com${p}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    // 2. Destinations
    destinations.forEach(d => {
      const slug = toSlug(d.id);
      if (slug) {
        xml += `  <url>\n`;
        xml += `    <loc>https://hillytrip.com/destinations/${slug}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += `  </url>\n`;
      }
    });

    // 3. Attractions
    attractions.forEach(a => {
      const slug = toSlug(a.id);
      if (slug) {
        xml += `  <url>\n`;
        xml += `    <loc>https://hillytrip.com/attractions/${slug}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += `  </url>\n`;
      }
    });

    // 4. Homestays
    homestays.forEach(h => {
      const slug = toSlug(h.id);
      if (slug) {
        xml += `  <url>\n`;
        xml += `    <loc>https://hillytrip.com/homestays/${slug}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      }
    });

    // 5. Routes
    routes.forEach(r => {
      const slug = toSlug(r.id);
      if (slug) {
        xml += `  <url>\n`;
        xml += `    <loc>https://hillytrip.com/routes/${slug}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.5</priority>\n`;
        xml += `  </url>\n`;
      }
    });

    xml += `</urlset>\n`;

    const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    
    // Ensure parent directory exists robustly
    const parentDir = path.dirname(outputPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, xml, 'utf-8');
    console.log(`[Sitemap Generator] Successfully compiled static sitemap to ${outputPath}`);
  } catch (writeError) {
    console.error('[Sitemap Generator] Failed to write sitemap.xml file:', writeError);
  }
}

// Wrap the whole execution to guarantee we NEVER crash the production build
try {
  generate();
} catch (globalError) {
  console.error('[Sitemap Generator] Critical unhandled error inside sitemap generation:', globalError);
}
