import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useDocumentStore } from '../modules/documents/documentStore';
import { editorThemes, exportThemes } from '../modules/themes/themes';
import { useExportService } from '../modules/exports/exportService';
import { downloadText } from '../utils/download';
import { PaginationDiagnosticsPanel } from './PaginationDiagnosticsPanel';
import { editorBus } from '../modules/editor/editorBus';

export const PropertiesPanel = () => {
  const document = useDocumentStore((state) => state.document);
  const [previewType, setPreviewType] = useState<'standard' | 'wechat'>('standard');
  const { exportStandard, exportWechat } = useExportService();

  const themeDescription = useMemo(() => {
    const editorTheme = editorThemes.find((theme) => theme.id === document.themes.editor);
    const exportTheme = exportThemes.find((theme) => theme.id === document.themes.export);

    return {
      editor: editorTheme?.description ?? '——',
      export: exportTheme?.description ?? '——',
    };
  }, [document.themes.editor, document.themes.export]);

  const htmlPreview = useMemo(() => {
    return previewType === 'standard' ? exportStandard() : exportWechat();
  }, [previewType, exportStandard, exportWechat]);

  const blocks = useMemo(() => {
    return Object.values(document.blocks).sort((a, b) => {
      const timeA = a.meta.updatedAt ? Date.parse(a.meta.updatedAt) : 0;
      const timeB = b.meta.updatedAt ? Date.parse(b.meta.updatedAt) : 0;
      return timeB - timeA;
    });
  }, [document.blocks]);

  const removeBlock = useDocumentStore((state) => state.removeBlock);

  return (
    <aside className="cm-properties" aria-label="属性面板">
      <section className="cm-panel" aria-label="主题说明">
        <header className="cm-panel__header">当前主题</header>
        <div>
          <strong>编辑主题：</strong>
          <p>{themeDescription.editor}</p>
        </div>
        <div>
          <strong>导出主题：</strong>
          <p>{themeDescription.export}</p>
        </div>
      </section>

      <section className="cm-panel" aria-label="导出预览">
        <header className="cm-panel__header">导出 HTML 预览</header>
        <div role="group" aria-label="预览类型选择" style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`cm-button ${previewType === 'standard' ? 'cm-button--primary' : ''}`}
            onClick={() => setPreviewType('standard')}
          >
            标准版
          </button>
          <button
            type="button"
            className={`cm-button ${previewType === 'wechat' ? 'cm-button--primary' : ''}`}
            onClick={() => setPreviewType('wechat')}
          >
            公众号
          </button>
        </div>
        <div className="cm-preview-box" aria-live="polite">
          <p>当前预览为 {previewType === 'standard' ? '标准 HTML' : '公众号 HTML'}。</p>
          <button
            type="button"
            className="cm-button"
            onClick={() =>
              downloadText(
                `${document.title || 'canvasmark'}-${previewType}.html`,
                htmlPreview,
              )
            }
          >
            下载此版本
          </button>
        </div>
      </section>

      <PaginationDiagnosticsPanel />

      <section className="cm-panel" aria-label="Drawnix 块列表">
        <header className="cm-panel__header">
          Drawnix 白板
          <span className="cm-panel__badge" aria-live="polite">
            {blocks.length} 个
          </span>
        </header>
        {blocks.length === 0 ? (
          <p>
            使用工具栏的“插入白板块”按钮即可创建白板。首次插入会自动打开编辑器，你可以在其中绘制草图、脑图或流程。预览图会随保存自动
            同步，导出时将替换为图片。
          </p>
        ) : (
          <ul className="cm-drawnix-list">
            {blocks.map((block) => (
              <li key={block.blockId} className="cm-drawnix-list__item">
                <figure>
                  {block.preview ? (
                    <img src={block.preview} alt={block.description || `${block.blockId} 预览`} />
                  ) : (
                    <div className="cm-drawnix-list__empty">尚未生成预览</div>
                  )}
                  <figcaption>
                    <strong>{block.description || `Drawnix 块 ${block.blockId}`}</strong>
                    <span>
                      最近更新：
                      {block.meta.updatedAt
                        ? dayjs(block.meta.updatedAt).format('YYYY-MM-DD HH:mm')
                        : '尚未保存'}
                    </span>
                  </figcaption>
                </figure>
                <div className="cm-drawnix-list__actions">
                  <button
                    type="button"
                    className="cm-button cm-button--ghost"
                    onClick={() => editorBus.emit('drawnix:open-editor', { blockId: block.blockId })}
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    className="cm-button cm-button--danger"
                    onClick={() => removeBlock(block.blockId)}
                  >
                    移除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
};
