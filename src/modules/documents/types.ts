
import type { DrawnixBlockData } from '../blocks/drawnixTypes';

export interface DrawnixBlockSnapshot {
  blockId: string;
  type: 'drawnix';
  data: DrawnixBlockData | null;
  preview: string | null;
  size: {
    width: number;
    height: number;
    zoom: number;
  };
  meta: {
    author?: string;
    updatedAt?: string;
    readOnly?: boolean;
  };
  description?: string;
}

export interface DocumentAssets {
  images: Record<string, string>;
  previews: Record<string, string>;
  externals: string[];
}

export interface DocumentThemes {
  editor: string;
  export: string;
}

export interface DocumentModel {
  id: string;
  title: string;
  content: string;
  themes: DocumentThemes;
  assets: DocumentAssets;
  blocks: Record<string, DrawnixBlockSnapshot>;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentMeta {
  lastSavedAt: string | null;
  wordCount: number;
  paragraphCount: number;
  blockCount: number;
}

export interface DocumentPackage {
  meta: {
    documentId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    schemaVersion: number;
  };
  content: string;
  blocks: Record<string, DrawnixBlockSnapshot>;
  assets: DocumentAssets;
}
