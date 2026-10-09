import React from 'react';
import { BlogWidgetRenderer } from '../components/blog/BlogWidgets';
export { formatSlugToTitle, stripMarkdownToPlainText } from './stringUtils';
import { formatSlugToTitle } from './stringUtils';

/**
 * Resolves human-readable anchor text from label and url.
 * Guarantees visitors never see raw URLs, slugs, or database IDs as visible link text.
 */
export function resolveAnchorText(labelText: string, rawUrl: string): string {
  if (!labelText) return formatSlugToTitle(rawUrl);

  const trimmed = labelText.trim();
  const urlTrimmed = rawUrl ? rawUrl.trim() : '';

  // Check if labelText is raw URL, slug, or ID
  const isUrl = trimmed.startsWith('/') || trimmed.startsWith('http');
  const isSameAsUrl = trimmed === urlTrimmed || trimmed === `#${urlTrimmed}`;
  const isSlugWithHyphens = /^[a-z0-9]+-[a-z0-9-]+$/i.test(trimmed);
  const isInternalId = /^(VIL|ATT|HS|TX|ROUTE|BLOG)\d+/i.test(trimmed);

  if (isUrl || isSameAsUrl || isSlugWithHyphens || isInternalId) {
    return formatSlugToTitle(urlTrimmed || trimmed);
  }

  // Strip any embedded internal ID prefixes from anchor text
  const cleaned = trimmed.replace(/\b(VIL\d+|ATT\d+|HS\d+|TX\d+|ROUTE\d+)\b/gi, '').trim();
  return cleaned || formatSlugToTitle(urlTrimmed);
}

/**
 * Tokenizes and parses inline markdown formatting including links [Text](URL),
 * bold **Text**, italic *Text*, and inline code `Text`.
 * Returns React DOM nodes with proper clickable links and formatting.
 */
export function parseInlineFormatting(text: string, navigate: (path: string) => void): React.ReactNode {
  if (!text) return null;

  // First convert any standalone bracket links like [/destinations/chemchey] into [Chemchey](/destinations/chemchey)
  let preprocessed = text.replace(/\[(\/(?:destinations|attractions|homestays|taxi|routes)\/[a-zA-Z0-9_-]+)\](?!\()/g, (_m, path) => {
    return `[${formatSlugToTitle(path)}](${path})`;
  });

  // Strip any raw database IDs from body text
  preprocessed = preprocessed.replace(/\b(VIL\d+|ATT\d+|HS\d+|TX\d+|ROUTE\d+)\b/gi, '');

  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
  const boldRegex = /(\*\*|__)(.*?)\1/;
  const italicRegex = /(\*|_)(.*?)\1/;
  const codeRegex = /`([^`]+)`/;

  let firstMatch: { type: 'link' | 'bold' | 'italic' | 'code'; index: number; match: RegExpMatchArray } | null = null;

  const linkMatch = preprocessed.match(linkRegex);
  if (linkMatch && linkMatch.index !== undefined) {
    firstMatch = { type: 'link', index: linkMatch.index, match: linkMatch };
  }

  const boldMatch = preprocessed.match(boldRegex);
  if (boldMatch && boldMatch.index !== undefined) {
    if (!firstMatch || boldMatch.index < firstMatch.index) {
      firstMatch = { type: 'bold', index: boldMatch.index, match: boldMatch };
    }
  }

  const italicMatch = preprocessed.match(italicRegex);
  if (italicMatch && italicMatch.index !== undefined) {
    if (!firstMatch || italicMatch.index < firstMatch.index) {
      firstMatch = { type: 'italic', index: italicMatch.index, match: italicMatch };
    }
  }

  const codeMatch = preprocessed.match(codeRegex);
  if (codeMatch && codeMatch.index !== undefined) {
    if (!firstMatch || codeMatch.index < firstMatch.index) {
      firstMatch = { type: 'code', index: codeMatch.index, match: codeMatch };
    }
  }

  if (!firstMatch) {
    return preprocessed;
  }

  const before = preprocessed.substring(0, firstMatch.index);
  const matchedLength = firstMatch.match[0].length;
  const after = preprocessed.substring(firstMatch.index + matchedLength);

  const key = `${firstMatch.type}-${firstMatch.index}-${preprocessed.length}`;

  let matchedElement: React.ReactNode = null;

  if (firstMatch.type === 'link') {
    const rawLabel = firstMatch.match[1];
    const rawUrl = firstMatch.match[2];
    const displayLabel = resolveAnchorText(rawLabel, rawUrl);

    matchedElement = (
      <a
        key={key}
        href={rawUrl.startsWith('/') ? '#' + rawUrl : rawUrl}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (rawUrl.startsWith("/")) {
            navigate('#' + rawUrl);
          } else if (rawUrl.startsWith("#")) {
            navigate(rawUrl);
          } else {
            window.open(rawUrl, '_blank', 'noreferrer');
          }
        }}
        className="text-sky-400 hover:text-sky-300 font-bold hover:underline cursor-pointer transition-colors inline"
      >
        {displayLabel}
      </a>
    );
  } else if (firstMatch.type === 'bold') {
    const content = firstMatch.match[2];
    matchedElement = (
      <strong key={key} className="font-extrabold text-white">
        {parseInlineFormatting(content, navigate)}
      </strong>
    );
  } else if (firstMatch.type === 'italic') {
    const content = firstMatch.match[2];
    matchedElement = (
      <em key={key} className="italic text-slate-200">
        {parseInlineFormatting(content, navigate)}
      </em>
    );
  } else if (firstMatch.type === 'code') {
    const content = firstMatch.match[1];
    matchedElement = (
      <code key={key} className="bg-slate-800 text-sky-300 font-mono text-xs px-1.5 py-0.5 rounded">
        {content}
      </code>
    );
  }

  return (
    <React.Fragment key={`frag-${firstMatch.index}-${preprocessed.length}`}>
      {before ? parseInlineFormatting(before, navigate) : null}
      {matchedElement}
      {after ? parseInlineFormatting(after, navigate) : null}
    </React.Fragment>
  );
}

/**
 * Helper to parse markdown table syntax (| Col 1 | Col 2 |)
 */
function parseTableBlock(lines: string[], bIdx: number, navigate: (path: string) => void) {
  if (lines.length < 2) return null;

  const headerLine = lines[0];
  const bodyLines = lines.slice(2); // Skip separator line

  const parseCells = (line: string) =>
    line
      .split('|')
      .slice(1, -1)
      .map(c => c.trim());

  const headers = parseCells(headerLine);

  return (
    <div key={bIdx} className="my-6 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
      <table className="w-full text-left text-xs md:text-sm text-slate-300">
        <thead className="bg-slate-950 text-sky-400 font-extrabold border-b border-slate-800 uppercase tracking-wider text-[11px]">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3">
                {parseInlineFormatting(h, navigate)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {bodyLines.map((rowLine, rIdx) => {
            const cells = parseCells(rowLine);
            return (
              <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                {cells.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-3 font-medium">
                    {parseInlineFormatting(cell, navigate)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Full-featured, elegant Markdown Renderer converting raw markdown text into
 * structured HTML tags (headings, lists, blockquotes, tables, paragraphs) with inline link routing.
 */
export function MarkdownRenderer({ markdown, navigate }: { markdown: string; navigate: (path: string) => void }) {
  if (!markdown) return null;

  const rawLines = markdown.split(/\r?\n/);

  interface Block {
    type: 'h1' | 'h2' | 'h3' | 'h4' | 'ul' | 'ol' | 'blockquote' | 'hr' | 'p' | 'codeblock' | 'table' | 'widget';
    lines: string[];
  }

  const blocks: Block[] = [];
  let currentBlock: Block | null = null;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // Widget token shortcode detection [[WIDGET:...]]
    if (trimmed.includes('[[WIDGET:')) {
      if (currentBlock) blocks.push(currentBlock);
      blocks.push({ type: 'widget', lines: [trimmed] });
      currentBlock = null;
      continue;
    }

    // Table detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (currentBlock && currentBlock.type === 'table') {
        currentBlock.lines.push(trimmed);
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'table', lines: [trimmed] };
      }
      continue;
    }

    // Code block start/end ```
    if (trimmed.startsWith('```')) {
      if (currentBlock && currentBlock.type === 'codeblock') {
        blocks.push(currentBlock);
        currentBlock = null;
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'codeblock', lines: [] };
      }
      continue;
    }

    if (currentBlock && currentBlock.type === 'codeblock') {
      currentBlock.lines.push(line);
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      if (currentBlock) blocks.push(currentBlock);
      blocks.push({ type: 'hr', lines: [] });
      currentBlock = null;
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      if (currentBlock) blocks.push(currentBlock);
      blocks.push({ type: 'h1', lines: [trimmed.substring(2)] });
      currentBlock = null;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (currentBlock) blocks.push(currentBlock);
      blocks.push({ type: 'h2', lines: [trimmed.substring(3)] });
      currentBlock = null;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      if (currentBlock) blocks.push(currentBlock);
      blocks.push({ type: 'h3', lines: [trimmed.substring(4)] });
      currentBlock = null;
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      if (currentBlock) blocks.push(currentBlock);
      blocks.push({ type: 'h4', lines: [trimmed.substring(5)] });
      currentBlock = null;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      if (currentBlock && currentBlock.type === 'blockquote') {
        currentBlock.lines.push(trimmed.substring(2));
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'blockquote', lines: [trimmed.substring(2)] };
      }
      continue;
    }

    // Unordered List (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemContent = trimmed.substring(2).trim();
      if (currentBlock && currentBlock.type === 'ul') {
        currentBlock.lines.push(itemContent);
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'ul', lines: [itemContent] };
      }
      continue;
    }

    // Ordered List (1., 2., etc)
    if (/^\d+\.\s+/.test(trimmed)) {
      const itemContent = trimmed.replace(/^\d+\.\s+/, '').trim();
      if (currentBlock && currentBlock.type === 'ol') {
        currentBlock.lines.push(itemContent);
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'ol', lines: [itemContent] };
      }
      continue;
    }

    // Empty line
    if (trimmed === '') {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }

    // Paragraph line
    if (currentBlock && currentBlock.type === 'p') {
      currentBlock.lines.push(trimmed);
    } else {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = { type: 'p', lines: [trimmed] };
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return (
    <div className="space-y-6 text-slate-200 leading-relaxed font-sans">
      {blocks.map((block, bIdx) => {
        if (block.type === 'h1') {
          return (
            <h1 key={bIdx} className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-8 mb-4 border-b border-slate-800 pb-3">
              {parseInlineFormatting(block.lines.join(' '), navigate)}
            </h1>
          );
        }

        if (block.type === 'h2') {
          return (
            <h2 key={bIdx} className="text-xl md:text-2xl font-extrabold text-sky-400 tracking-tight mt-8 mb-4 border-b border-slate-800/80 pb-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0"></span>
              <span>{parseInlineFormatting(block.lines.join(' '), navigate)}</span>
            </h2>
          );
        }

        if (block.type === 'h3') {
          return (
            <h3 key={bIdx} className="text-lg font-bold text-white tracking-wide mt-6 mb-3">
              {parseInlineFormatting(block.lines.join(' '), navigate)}
            </h3>
          );
        }

        if (block.type === 'h4') {
          return (
            <h4 key={bIdx} className="text-base font-bold text-slate-300 uppercase tracking-wider font-mono mt-5 mb-2">
              {parseInlineFormatting(block.lines.join(' '), navigate)}
            </h4>
          );
        }

        if (block.type === 'table') {
          return parseTableBlock(block.lines, bIdx, navigate);
        }

        if (block.type === 'ul') {
          return (
            <ul key={bIdx} className="my-4 space-y-2.5 pl-1">
              {block.lines.map((item, lIdx) => (
                <li key={lIdx} className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
                  <span className="text-sky-400 font-bold shrink-0 mt-1 text-base">•</span>
                  <div className="flex-grow">{parseInlineFormatting(item, navigate)}</div>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'ol') {
          return (
            <ol key={bIdx} className="my-4 space-y-2.5 pl-1">
              {block.lines.map((item, lIdx) => (
                <li key={lIdx} className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
                  <span className="text-sky-400 font-mono text-xs font-black shrink-0 mt-0.5 px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded-md">
                    {lIdx + 1}
                  </span>
                  <div className="flex-grow">{parseInlineFormatting(item, navigate)}</div>
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === 'blockquote') {
          return (
            <blockquote key={bIdx} className="my-6 p-4 bg-slate-900/60 border-l-4 border-sky-500 rounded-r-2xl italic text-slate-300 text-sm">
              {parseInlineFormatting(block.lines.join(' '), navigate)}
            </blockquote>
          );
        }

        if (block.type === 'hr') {
          return <hr key={bIdx} className="my-8 border-slate-800" />;
        }

        if (block.type === 'widget') {
          const token = block.lines.join(' ').trim();
          return <BlogWidgetRenderer key={bIdx} token={token} navigate={navigate} />;
        }

        if (block.type === 'codeblock') {
          return (
            <pre key={bIdx} className="my-4 p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto">
              <code>{block.lines.join('\n')}</code>
            </pre>
          );
        }

        // Paragraph
        const textContent = block.lines.join(' ');
        if (!textContent.trim()) return null;

        return (
          <p key={bIdx} className="text-slate-300 text-sm md:text-[15px] leading-relaxed mb-4 text-justify">
            {parseInlineFormatting(textContent, navigate)}
          </p>
        );
      })}
    </div>
  );
}

