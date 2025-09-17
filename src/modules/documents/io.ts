import type { DocumentModel, DocumentPackage } from './types';

const PACKAGE_VERSION = 1;

export const buildDocumentPackage = (document: DocumentModel): DocumentPackage => ({
  meta: {
    documentId: document.id,
    title: document.title,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    schemaVersion: PACKAGE_VERSION,
  },
  content: document.content,
  blocks: document.blocks,
  assets: document.assets,
});

export const serializePackage = (pkg: DocumentPackage): string => {
  return JSON.stringify(pkg, null, 2);
};

export const downloadPackage = (pkg: DocumentPackage) => {
  const data = serializePackage(pkg);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${pkg.meta.title || 'canvasmark-document'}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const readPackageFile = (file: File): Promise<DocumentPackage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const pkg = JSON.parse(reader.result as string) as DocumentPackage;
        resolve(pkg);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, 'utf-8');
  });
};
