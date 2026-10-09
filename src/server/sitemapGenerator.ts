import express from 'express';
import { dbStore } from './db';
import { toSlug } from '../utils/slug';

export function generateSitemapXml(baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const now = new Date().toISOString().split('T')[0];

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
    xml += `    <loc>${cleanBase}${page.path}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Dynamic Destinations (if present in store)
  try {
    const destinations = dbStore.getDestinations() || [];
    for (const d of destinations) {
      if (!d || (!d.slug && !d.id && !d.name)) continue;
      const slug = (d.slug || (d.name ? toSlug(d.name) : '') || d.id).toLowerCase();
      xml += `  <url>\n`;
      xml += `    <loc>${cleanBase}/#/destination/${encodeURIComponent(slug)}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.85</priority>\n`;
      xml += `  </url>\n`;
    }
  } catch (e) {
    console.warn('[Sitemap] Failed to append destinations to XML sitemap:', e);
  }

  // Dynamic Villages (Primary Location Entities)
  try {
    const villages = dbStore.getVillages() || [];
    for (const v of villages) {
      if (!v || (!v.village_code && !(v as any).slug && !(v as any).id)) continue;
      const slug = (v.village_code || (v as any).slug || (v as any).id).toLowerCase();
      xml += `  <url>\n`;
      xml += `    <loc>${cleanBase}/#/village/${encodeURIComponent(slug)}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.85</priority>\n`;
      xml += `  </url>\n`;
    }
  } catch (e) {
    console.warn('[Sitemap] Failed to append villages to XML sitemap:', e);
  }

  // Dynamic Attractions (Canonical SEO format: /attraction/{slug} with NO hash fragments)
  try {
    const attractions = dbStore.getAttractions() || [];
    for (const a of attractions) {
      if (!a || (!a.slug && !a.id && !a.name)) continue;
      const cleanSlug = (a.slug && typeof a.slug === 'string' && a.slug.trim())
        ? toSlug(a.slug)
        : (a.name ? toSlug(a.name) : (a.id ? String(a.id).toLowerCase() : ''));
      if (!cleanSlug) continue;
      xml += `  <url>\n`;
      xml += `    <loc>${cleanBase}/attraction/${encodeURIComponent(cleanSlug)}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.75</priority>\n`;
      xml += `  </url>\n`;
    }
  } catch (e) {
    console.warn('[Sitemap] Failed to append attractions to XML sitemap:', e);
  }

  // Dynamic Homestays
  try {
    const homestays = dbStore.getHomestays() || [];
    for (const h of homestays) {
      if (!h || (!h.slug && !h.id)) continue;
      const slug = (h.slug || h.id).toLowerCase();
      xml += `  <url>\n`;
      xml += `    <loc>${cleanBase}/#/homestay/${encodeURIComponent(slug)}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.80</priority>\n`;
      xml += `  </url>\n`;
    }
  } catch (e) {
    console.warn('[Sitemap] Failed to append homestays to XML sitemap:', e);
  }

  xml += `</urlset>`;
  return xml;
}
