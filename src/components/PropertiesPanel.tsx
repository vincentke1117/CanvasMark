import { useMemo, useState } from 'react';
import { useDocumentStore } from '../modules/documents/documentStore';
import { editorThemes, exportThemes } from '../modules/themes/themes';
import { useExportService } from '../modules/exports/exportService';
import { downloadText } from '../utils/download';

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

      <section className="cm-panel" aria-label="Drawnix 块概况">
        <header className="cm-panel__header">Drawnix 块（预览阶段）</header>
        <p>
          当前共有 {Object.keys(document.blocks).length} 个 Drawnix 块。使用工具栏的“插入白板块”按钮，可在光标处生成
          <code style={{ marginLeft: '0.25rem' }}>{'{{drawnix:blockId}}'}</code> 占位并登记到项目包中。
        </p>
        <p style={{ fontSize: '0.85rem', color: 'rgba(31,31,36,0.7)' }}>
          导出标准 HTML / 公众号 HTML 时，占位会替换为预览图片；若预览缺失，将以占位提示保留。后续版本将解锁白板内容的在线编辑。
        </p>
      </section>
    </aside>
  );
};
