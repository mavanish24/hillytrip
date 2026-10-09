// src/utils/stringUtils.ts
// Pure string manipulation and text formatting utilities with ZERO component or external map dependencies.

/**
 * Format slug or path into clean human-readable Title Case
 * e.g. "chemchey-view-point" -> "Chemchey View Point"
 * e.g. "/attractions/chemchey-view-point" -> "Chemchey View Point"
 */
export function formatSlugToTitle(slugOrPath: string): string {
  if (!slugOrPath) return '';
  // Extract last segment of path if full path
  let lastSeg = slugOrPath.split('/').filter(Boolean).pop() || slugOrPath;
  // Strip trailing/leading brackets/queries
  lastSeg = lastSeg.replace(/^[\[\(/]+|[\]\)]+$/g, '');
  // Strip internal prefix like VIL, ATT, HS if present
  lastSeg = lastSeg.replace(/^(VIL|ATT|HS|TX|ROUTE)\d*[-_]?/i, '');
  if (!lastSeg) return 'Explore';
  // Replace hyphens and underscores with spaces
  const words = lastSeg.split(/[-_]+/);
  return words
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Strips all Markdown syntax from a string, producing clean, natural plain text
 * ideal for teasers, search result snippets, and SEO meta descriptions.
 */
export function stripMarkdownToPlainText(md: string): string {
  if (!md) return '';
  return md
    // Strip widget tokens [[WIDGET:...]]
    .replace(/\[\[WIDGET:[^\]]+\]\]/gi, '')
    // Replace markdown links [Text](URL) with just clean text or resolved title
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => {
      const isTechnicalLabel = label.startsWith('/') || label.startsWith('http') || /^[a-z0-9]+-[a-z0-9-]+$/i.test(label) || /^(VIL|ATT|HS|TX|ROUTE)\d+/i.test(label);
      return isTechnicalLabel ? formatSlugToTitle(url || label) : label;
    })
    // Replace standalone bracket paths [/path/slug] with clean name
    .replace(/\[(\/(?:destinations|attractions|homestays|taxi|routes)\/[a-zA-Z0-9_-]+)\]/g, (_m, path) => formatSlugToTitle(path))
    // Remove headers (# Header)
    .replace(/^#+\s+/gm, '')
    // Remove bold and italic formatting (* or _)
    .replace(/(\*\*|__|\*|_)/g, '')
    // Remove inline code ticks
    .replace(/`([^`]+)`/g, '$1')
    // Remove list item bullets or numbers
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove blockquote angle brackets
    .replace(/^\s*>\s+/gm, '')
    // Remove raw database IDs
    .replace(/\b(VIL\d+|ATT\d+|HS\d+|TX\d+|ROUTE\d+)\b/gi, '')
    // Collapse multiple whitespace/newlines into a single space
    .replace(/\s+/g, ' ')
    .trim();
}
