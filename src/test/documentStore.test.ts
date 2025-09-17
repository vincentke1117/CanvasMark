import { describe, expect, it } from 'vitest';
import { useDocumentStore } from '../modules/documents/documentStore';
import { createEmptyDrawnixSnapshot } from '../modules/blocks/drawnixPlaceholders';


const resetStore = () => {
  const { newDocument } = useDocumentStore.getState();
  newDocument();
};

describe('useDocumentStore', () => {
  it('should update document content and meta', () => {
    resetStore();
    const { setContent } = useDocumentStore.getState();
    setContent('# Title\n\nHello world');
    const state = useDocumentStore.getState();
    expect(state.document.content).toContain('Hello world');
    expect(state.meta.wordCount).toBeGreaterThan(1);
    expect(state.isDirty).toBe(true);
  });

  it('should update themes independently', () => {
    resetStore();
    const { setThemes } = useDocumentStore.getState();
    setThemes({ editor: 'noir' });
    const state = useDocumentStore.getState();
    expect(state.document.themes.editor).toBe('noir');
    expect(state.document.themes.export).toBe('classic');
  });


  it('should update drawnix block snapshot', () => {
    resetStore();
    const { registerBlock, updateBlock } = useDocumentStore.getState();
    const snapshot = createEmptyDrawnixSnapshot('test-block');
    registerBlock(snapshot);
    updateBlock('test-block', (prev) => ({
      ...prev,
      description: '更新后的白板',
      preview: 'data:image/png;base64,dummy',
      meta: { ...prev.meta, updatedAt: '2024-01-01T00:00:00.000Z' },
    }));
    const state = useDocumentStore.getState();
    expect(state.document.blocks['test-block'].preview).toContain('data:image/png');
    expect(state.document.blocks['test-block'].description).toBe('更新后的白板');
    expect(state.isDirty).toBe(true);
  });

});
