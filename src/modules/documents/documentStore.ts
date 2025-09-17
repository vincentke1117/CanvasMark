import { create } from 'zustand';
import { generateId } from '../../utils/id';
import { deriveMeta } from './documentUtils';
import type {
  DocumentAssets,
  DocumentMeta,
  DocumentModel,
  DocumentPackage,
  DocumentThemes,
  DrawnixBlockSnapshot,
} from './types';

const createEmptyAssets = (): DocumentAssets => ({
  images: {},
  previews: {},
  externals: [],
});

const createInitialDocument = (): DocumentModel => {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: '未命名文档',
    content: '# 欢迎来到 CanvasMark\n\n开始书写，或从“文件”菜单导入项目包。',
    themes: {
      editor: 'aurora',
      export: 'classic',
    },
    assets: createEmptyAssets(),
    blocks: {},
    createdAt: now,
    updatedAt: now,
  };
};

type DocumentState = {
  document: DocumentModel;
  meta: DocumentMeta;
  isDirty: boolean;
};

type DocumentActions = {
  setContent: (markdown: string) => void;
  setTitle: (title: string) => void;
  setThemes: (themes: Partial<DocumentThemes>) => void;
  registerBlock: (snapshot: DrawnixBlockSnapshot) => void;
  updateBlock: (
    blockId: string,
    updater: (snapshot: DrawnixBlockSnapshot) => DrawnixBlockSnapshot,
  ) => void;
  removeBlock: (blockId: string) => void;
  markSaved: () => void;
  newDocument: () => void;
  loadFromPackage: (pkg: DocumentPackage) => void;
};

const initialDocument = createInitialDocument();

const initialState: DocumentState = {
  document: initialDocument,
  meta: deriveMeta(initialDocument.content, 0, null),
  isDirty: false,
};

export const useDocumentStore = create<DocumentState & DocumentActions>((set) => ({
  ...initialState,
  setContent: (markdown) =>
    set((state) => {
      const nextDocument = {
        ...state.document,
        content: markdown,
        updatedAt: new Date().toISOString(),
      };

      return {
        document: nextDocument,
        meta: deriveMeta(markdown, Object.keys(nextDocument.blocks).length, state.meta.lastSavedAt),
        isDirty: true,
      };
    }),
  setTitle: (title) =>
    set((state) => ({
      document: {
        ...state.document,
        title,
        updatedAt: new Date().toISOString(),
      },
      meta: state.meta,
      isDirty: true,
    })),
  setThemes: (themes) =>
    set((state) => ({
      document: {
        ...state.document,
        themes: {
          ...state.document.themes,
          ...themes,
        },
        updatedAt: new Date().toISOString(),
      },
      meta: state.meta,
      isDirty: true,
    })),
  registerBlock: (snapshot) =>
    set((state) => {
      const nextBlocks = {
        ...state.document.blocks,
        [snapshot.blockId]: snapshot,
      };
      const nextDocument = {
        ...state.document,
        blocks: nextBlocks,
        updatedAt: new Date().toISOString(),
      };

      return {
        document: nextDocument,
        meta: deriveMeta(nextDocument.content, Object.keys(nextBlocks).length, state.meta.lastSavedAt),
        isDirty: true,
      };
    }),
  updateBlock: (blockId, updater) =>
    set((state) => {
      const current = state.document.blocks[blockId];
      if (!current) return state;

      const nextSnapshot = updater(current);
      const nextBlocks = {
        ...state.document.blocks,
        [blockId]: nextSnapshot,
      };
      const nextDocument = {
        ...state.document,
        blocks: nextBlocks,
        updatedAt: new Date().toISOString(),
      };

      return {
        document: nextDocument,
        meta: deriveMeta(
          nextDocument.content,
          Object.keys(nextBlocks).length,
          state.meta.lastSavedAt,
        ),
        isDirty: true,
      };
    }),
  removeBlock: (blockId) =>
    set((state) => {
      const nextBlocks = { ...state.document.blocks };
      delete nextBlocks[blockId];
      const nextDocument = {
        ...state.document,
        blocks: nextBlocks,
        updatedAt: new Date().toISOString(),
      };

      return {
        document: nextDocument,
        meta: deriveMeta(
          nextDocument.content,
          Object.keys(nextBlocks).length,
          state.meta.lastSavedAt,
        ),
        isDirty: true,
      };
    }),
  markSaved: () =>
    set((state) => ({
      meta: {
        ...state.meta,
        lastSavedAt: new Date().toISOString(),
      },
      isDirty: false,
    })),
  newDocument: () =>
    set(() => {
      const next = createInitialDocument();
      return {
        document: next,
        meta: deriveMeta(next.content, 0, null),
        isDirty: false,
      };
    }),
  loadFromPackage: (pkg) =>
    set(() => {
      const model: DocumentModel = {
        id: pkg.meta.documentId,
        title: pkg.meta.title,
        content: pkg.content,
        themes: {
          editor: 'aurora',
          export: 'classic',
        },
        assets: pkg.assets,
        blocks: pkg.blocks,
        createdAt: pkg.meta.createdAt,
        updatedAt: pkg.meta.updatedAt,
      };

      return {
        document: model,
        meta: deriveMeta(model.content, Object.keys(model.blocks).length, pkg.meta.updatedAt),
        isDirty: false,
      };
    }),
}));
