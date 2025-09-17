import { describe, expect, it } from 'vitest';
import {
  buildDrawnixPlaceholder,
  createEmptyDrawnixSnapshot,
  extractDrawnixPlaceholderId,
  injectDrawnixBlocks,
  renderDrawnixBlockHtml,
} from '../modules/blocks/drawnixPlaceholders';

describe('drawnix placeholders', () => {
  it('should build and extract placeholder ids', () => {
    const blockId = 'block-123';
    const placeholder = buildDrawnixPlaceholder(blockId);
    expect(placeholder).toBe('{{drawnix:block-123}}');
    expect(extractDrawnixPlaceholderId(placeholder)).toBe(blockId);
  });

  it('should render preview html when snapshot has preview', () => {
    const snapshot = {
      ...createEmptyDrawnixSnapshot('block-1'),
      preview: 'data:image/png;base64,xxx',
      description: '流程图',
    };
    const html = renderDrawnixBlockHtml('block-1', snapshot);
    expect(html).toContain('canvasmark-drawnix');
    expect(html).toContain('流程图');
    expect(html).toContain(snapshot.preview);
  });

  it('should inject placeholders inside markdown', () => {
    const snapshot = {
      ...createEmptyDrawnixSnapshot('block-A'),
      preview: 'data:image/png;base64,yyy',
    };
    const markdown = ['前置内容', buildDrawnixPlaceholder('block-A'), '后续内容'].join('\n\n');
    const htmlReady = injectDrawnixBlocks(markdown, { 'block-A': snapshot });
    expect(htmlReady).toContain('figure class="canvasmark-drawnix"');
    expect(htmlReady).not.toContain('{{drawnix:block-A}}');
  });

  it('should fallback when snapshot missing', () => {
    const markdown = buildDrawnixPlaceholder('missing');
    const htmlReady = injectDrawnixBlocks(markdown, {});
    expect(htmlReady).toContain('canvasmark-drawnix--missing');
    expect(htmlReady).toContain('missing');
  });
});
