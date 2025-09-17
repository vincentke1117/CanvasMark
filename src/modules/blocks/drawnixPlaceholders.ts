import type { DrawnixBlockSnapshot } from '../documents/types';

export const DRAWNIX_PLACEHOLDER_TOKEN = 'drawnix';
const PLACEHOLDER_BODY = `{{${DRAWNIX_PLACEHOLDER_TOKEN}:%s}}`;

export const DRAWNIX_PLACEHOLDER_LINE = new RegExp(
  String.raw`^\s*\{\{\s*${DRAWNIX_PLACEHOLDER_TOKEN}:([a-zA-Z0-9_-]+)\s*\}\}\s*$`,
);

export const buildDrawnixPlaceholder = (blockId: string) =>
  PLACEHOLDER_BODY.replace('%s', blockId);

export const extractDrawnixPlaceholderId = (text: string): string | null => {
  const match = text.match(DRAWNIX_PLACEHOLDER_LINE);
  return match ? match[1] : null;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildSizeStyle = (block?: DrawnixBlockSnapshot) => {
  if (!block?.size?.width) {
    return '';
  }

  const width = Math.max(block.size.width, 120);
  return ` style="max-width:${width}px"`;
};

export const renderDrawnixBlockHtml = (
  blockId: string,
  block?: DrawnixBlockSnapshot,
): string => {
  const escapedId = escapeHtml(blockId);

  if (!block) {
    return `<figure class="canvasmark-drawnix canvasmark-drawnix--missing" data-block-id="${escapedId}"><div class="canvasmark-drawnix__fallback">缺失的 Drawnix 块（${escapedId}）。请检查项目包或重新插入。</div></figure>`;
  }

  const style = buildSizeStyle(block);
  const description = block.description?.trim();
  const caption = description
    ? `<figcaption class="canvasmark-drawnix__caption">${escapeHtml(description)}</figcaption>`
    : '';
  const altText = escapeHtml(description || `Drawnix 白板块 ${blockId}`);

  if (block.preview) {
    return `<figure class="canvasmark-drawnix" data-block-id="${escapedId}"${style}><img src="${block.preview}" alt="${altText}" loading="lazy" decoding="async" />${caption}</figure>`;
  }

  return `<figure class="canvasmark-drawnix canvasmark-drawnix--empty" data-block-id="${escapedId}"${style}><div class="canvasmark-drawnix__fallback">Drawnix 块（${escapedId}）尚未生成预览，后续导出将自动补齐。</div>${caption}</figure>`;
};

const DRAWNIX_PLACEHOLDER_LINE_GLOBAL = new RegExp(DRAWNIX_PLACEHOLDER_LINE.source, 'gm');

export const injectDrawnixBlocks = (
  markdown: string,
  blocks: Record<string, DrawnixBlockSnapshot>,
): string => {
  return markdown.replace(DRAWNIX_PLACEHOLDER_LINE_GLOBAL, (_, blockId: string) =>
    renderDrawnixBlockHtml(blockId, blocks[blockId]),
  );
};

export const createEmptyDrawnixSnapshot = (
  blockId: string,
): DrawnixBlockSnapshot => ({
  blockId,
  type: 'drawnix',
  data: null,
  preview: null,
  size: {
    width: 960,
    height: 540,
    zoom: 1,
  },
  meta: {
    updatedAt: new Date().toISOString(),
  },
  description: 'Drawnix 白板块',
});
