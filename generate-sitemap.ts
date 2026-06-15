import * as fs from 'fs';
import * as path from 'path';

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
  
  const dbPath = path.join(process.cwd(), 'hillytrip_db_store.json');
  if (!fs.existsSync(dbPath)) {
    console.error(`[Sitemap Generator] Error: DB Store file not found at ${dbPath}`);
    process.exit(1);
  }

  // Load and parse DB store
  const dbDataRaw = fs.readFileSync(dbPath, 'utf-8');
  const dbData = JSON.parse(dbDataRaw);

  const destinations: Resource[] = dbData.destinations || [];
  const attractions: Resource[] = dbData.attractions || [];
  const homestays: Resource[] = dbData.homestays || [];
  const routes: Resource[] = dbData.routes || [];

  console.log(`[Sitemap Generator] Loaded ${destinations.length} destinations, ${attractions.length} attractions, ${homestays.length} homestays, ${routes.length} routes.`);

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
  fs.writeFileSync(outputPath, xml, 'utf-8');
  console.log(`[Sitemap Generator] Successfully compiled static sitemap to ${outputPath}`);
}

generate();
