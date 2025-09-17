import { useDocumentStore } from '../modules/documents/documentStore';

export const StatusBar = () => {
  const meta = useDocumentStore((state) => state.meta);
  const isDirty = useDocumentStore((state) => state.isDirty);

  return (
    <footer className="cm-status-bar" aria-live="polite">
      <span>
        字数：{meta.wordCount} · 段落：{meta.paragraphCount} · 块：{meta.blockCount}
      </span>
      <span>
        {isDirty ? '未保存的更改' : meta.lastSavedAt ? `已保存：${new Date(meta.lastSavedAt).toLocaleString()}` : '尚未保存'}
      </span>
    </footer>
  );
};
