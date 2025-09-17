import { useEffect } from 'react';
import { useDocumentStore } from '../modules/documents/documentStore';

export const useEditorTheme = () => {
  const editorTheme = useDocumentStore((state) => state.document.themes.editor);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-editor-theme', editorTheme);
  }, [editorTheme]);

  return editorTheme;
};
