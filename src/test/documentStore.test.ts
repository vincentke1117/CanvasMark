import { describe, expect, it } from 'vitest';
import { useDocumentStore } from '../modules/documents/documentStore';

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
});
