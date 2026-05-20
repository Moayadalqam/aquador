export interface DescriptionSection {
  title: string;
  body: string[];
  bullets: string[];
}

export interface ParsedProductDescription {
  summary: string[];
  sections: DescriptionSection[];
  notes: Array<{ label: string; value: string }>;
  assurances: string[];
}

const ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
};

const SECTION_TITLES = new Set([
  'the scent experience',
  'opening',
  'development',
  'dry-down',
  'dry down',
  'why you’ll love it',
  "why you'll love it",
  'perfect for',
  'fragrance notes',
]);

function decodeEntities(value: string): string {
  return value
    .replace(/&(?:nbsp|amp|quot|#39|apos|lt|gt);/g, (entity) => ENTITY_MAP[entity] ?? entity)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

export function htmlToPlainDescription(description: string): string {
  return decodeEntities(description)
    .replace(/\r\n/g, '\n')
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|ul|ol|blockquote)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/\u00a0/g, ' ')
    .split('\n')
    .map((line) =>
      line
        .replace(/[ \t]+/g, ' ')
        .replace(/^\s*[•·]\s*/, '• ')
        .replace(/^✔\s*/, '✔ ')
        .trim()
    )
    .filter((line, index, lines) => line.length > 0 && !(line === lines[index - 1]))
    .join('\n');
}

function cleanTitle(value: string): string {
  return value.replace(/:$/, '').trim();
}

function isSectionTitle(line: string): boolean {
  return SECTION_TITLES.has(cleanTitle(line).toLowerCase());
}

function pushSection(
  sections: DescriptionSection[],
  current: DescriptionSection | null
): DescriptionSection | null {
  if (!current) return null;
  if (current.body.length > 0 || current.bullets.length > 0) {
    sections.push(current);
  }
  return null;
}

export function parseProductDescription(description: string): ParsedProductDescription {
  const lines = htmlToPlainDescription(description)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const summary: string[] = [];
  const sections: DescriptionSection[] = [];
  const notes: Array<{ label: string; value: string }> = [];
  const assurances: string[] = [];
  let current: DescriptionSection | null = null;

  for (const line of lines) {
    const noteMatch = line.match(/^(Top Notes|Heart Notes|Base Notes)\s*:\s*(.+)$/i);
    if (noteMatch) {
      notes.push({ label: noteMatch[1], value: noteMatch[2] });
      continue;
    }

    if (line.startsWith('✔')) {
      assurances.push(line.replace(/^✔\s*/, '').trim());
      continue;
    }

    if (isSectionTitle(line)) {
      current = pushSection(sections, current);
      if (cleanTitle(line).toLowerCase() === 'fragrance notes') {
        continue;
      }
      current = { title: cleanTitle(line), body: [], bullets: [] };
      continue;
    }

    if (line.startsWith('•')) {
      const bullet = line.replace(/^•\s*/, '').trim();
      if (bullet) {
        if (!current) current = { title: 'Details', body: [], bullets: [] };
        current.bullets.push(bullet);
      }
      continue;
    }

    if (current) {
      current.body.push(line);
    } else {
      summary.push(line);
    }
  }

  pushSection(sections, current);

  return { summary, sections, notes, assurances };
}

export function stripProductDescription(description: string, maxLength?: number): string {
  const plain = htmlToPlainDescription(description).replace(/\n+/g, ' ').trim();
  if (!maxLength || plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength - 1).trimEnd()}…`;
}

export function isDisallowedSampleSize(size: string): boolean {
  return /\b2\s*ml\b/i.test(size.trim());
}
