const fs = require('fs');
const path = require('path');

function toSlug(text) {
  if (text === undefined || text === null) return '';
  const str = String(text);
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s_'-]/g, '')
    .trim()
    .replace(/[\s_']+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateSitemap() {
  const baseUrl = (process.env.APP_URL || 'https://hillytrip.com').replace(/\/+$/, '');
  const now = new Date().toISOString().split('T')[0];

  const dbPath = path.join(process.cwd(), 'hillytrip_db_store.json');
  if (!fs.existsSync(dbPath)) {
    console.warn('[generate-sitemap] hillytrip_db_store.json not found, skipping static generation');
    return;
  }

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  const staticPages = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/#/explore', priority: '0.9', changefreq: 'daily' },
    { path: '/#/villages', priority: '0.9', changefreq: 'daily' },
    { path: '/#/homestays', priority: '0.9', changefreq: 'daily' },
    { path: '/#/taxi', priority: '0.8', changefreq: 'daily' },
    { path: '/#/guides', priority: '0.8', changefreq: 'weekly' },
    { path: '/#/ai-planner', priority: '0.7', changefreq: 'weekly' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static routes
  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Dynamic Destinations (if present)
  if (Array.isArray(db.destinations)) {
    for (const d of db.destinations) {
      if (!d || (!d.slug && !d.id && !d.name)) continue;
      const slug = (d.slug || (d.name ? toSlug(d.name) : '') || d.id).toLowerCase();
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/#/destination/${encodeURIComponent(slug)}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.85</priority>\n`;
      xml += `  </url>\n`;
    }
  }

  // Dynamic Villages
  if (Array.isArray(db.villages)) {
    for (const v of db.villages) {
      if (!v || (!v.village_code && !v.slug && !v.id)) continue;
      const slug = (v.village_code || v.slug || v.id).toLowerCase();
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/#/village/${encodeURIComponent(slug)}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.85</priority>\n`;
      xml += `  </url>\n`;
    }
  }

  // Dynamic Attractions (/attraction/{slug} with NO hash fragment)
  if (Array.isArray(db.attractions)) {
    for (const a of db.attractions) {
      if (!a || (!a.slug && !a.id && !a.name)) continue;
      const cleanSlug = (a.slug && typeof a.slug === 'string' && a.slug.trim())
        ? toSlug(a.slug)
        : (a.name ? toSlug(a.name) : (a.id ? String(a.id).toLowerCase() : ''));
      if (!cleanSlug) continue;
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/attraction/${encodeURIComponent(cleanSlug)}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.75</priority>\n`;
      xml += `  </url>\n`;
    }
  }

  // Dynamic Homestays
  if (Array.isArray(db.homestays)) {
    for (const h of db.homestays) {
      if (!h || (!h.slug && !h.id)) continue;
      const slug = (h.slug || h.id).toLowerCase();
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/#/homestay/${encodeURIComponent(slug)}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.80</priority>\n`;
      xml += `  </url>\n`;
    }
  }

  xml += `</urlset>`;

  const publicPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(publicPath, xml, 'utf-8');
  console.log(`[generate-sitemap] Wrote sitemap.xml to ${publicPath} (${xml.length} bytes)`);

  const distDir = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distDir)) {
    const distPath = path.join(distDir, 'sitemap.xml');
    fs.writeFileSync(distPath, xml, 'utf-8');
    console.log(`[generate-sitemap] Wrote sitemap.xml to ${distPath}`);
  }
}

generateSitemap();
