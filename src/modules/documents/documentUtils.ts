import type { DocumentMeta } from './types';

const countWords = (markdown: string) => {
  return markdown
    .replace(/[`*_>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length;
};

const countParagraphs = (markdown: string) => {
  return markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean).length;
};

export const deriveMeta = (
  markdown: string,
  blockCount: number,
  lastSavedAt: string | null,
): DocumentMeta => ({
  lastSavedAt,
  wordCount: countWords(markdown),
  paragraphCount: countParagraphs(markdown),
  blockCount,
});
