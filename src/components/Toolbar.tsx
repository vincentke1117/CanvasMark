import { ChangeEvent, useRef } from 'react';
import { useDocumentStore } from '../modules/documents/documentStore';
import { buildDocumentPackage, downloadPackage, readPackageFile } from '../modules/documents/io';
import { editorThemes, exportThemes } from '../modules/themes/themes';
import { useExportService } from '../modules/exports/exportService';
import { downloadText } from '../utils/download';
import { editorBus } from '../modules/editor/editorBus';
import { createEmptyDrawnixSnapshot } from '../modules/blocks/drawnixPlaceholders';
import { generateId } from '../utils/id';
import { useRovingFocus } from '../hooks/useRovingFocus';
import { PaginationMarkerMenu } from './PaginationMarkerMenu';

export const Toolbar = () => {
  const document = useDocumentStore((state) => state.document);
  const setTitle = useDocumentStore((state) => state.setTitle);
  const newDocument = useDocumentStore((state) => state.newDocument);
  const loadFromPackage = useDocumentStore((state) => state.loadFromPackage);
  const setThemes = useDocumentStore((state) => state.setThemes);
  const registerBlock = useDocumentStore((state) => state.registerBlock);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileGroupRef = useRef<HTMLDivElement | null>(null);
  const insertGroupRef = useRef<HTMLDivElement | null>(null);
  const exportGroupRef = useRef<HTMLDivElement | null>(null);
  const { exportStandard, exportWechat } = useExportService();

  useRovingFocus(fileGroupRef, { orientation: 'horizontal' });
  useRovingFocus(insertGroupRef, { orientation: 'horizontal' });
  useRovingFocus(exportGroupRef, { orientation: 'horizontal' });

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const pkg = await readPackageFile(file);
      loadFromPackage(pkg);
    } catch (error) {
      alert('导入失败，请确认文件格式正确。');
      console.error(error);
    } finally {
      event.target.value = '';
    }
  };

  const handleExportPackage = () => {
    const pkg = buildDocumentPackage(document);
    downloadPackage(pkg);
  };

  const handleExportStandard = () => {
    const html = exportStandard();
    downloadText(`${document.title || 'canvasmark'}.html`, html);
  };

  const handleExportWechat = () => {
    const html = exportWechat();
    downloadText(`${document.title || 'canvasmark'}-wechat.html`, html);
  };

  const handleInsertDrawnixBlock = () => {
    const blockId = generateId();
    registerBlock(createEmptyDrawnixSnapshot(blockId));
    editorBus.emit('insert:drawnix-block', { blockId });
    window.setTimeout(() => {
      editorBus.emit('drawnix:open-editor', { blockId });
    }, 0);
  };

  return (
    <header className="cm-toolbar" role="toolbar" aria-label="主工具栏">
      <div className="cm-toolbar__group" aria-label="文件操作" ref={fileGroupRef}>
        <button type="button" className="cm-button" onClick={newDocument} data-roving-item>
          新建
        </button>
        <button
          type="button"
          className="cm-button"
          onClick={() => fileInputRef.current?.click()}
          data-roving-item
        >
          打开
        </button>
        <button type="button" className="cm-button" onClick={handleExportPackage} data-roving-item>
          导出包
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={handleImport}
        />
      </div>

      <div className="cm-toolbar__group" aria-label="文档信息">
        <input
          className="cm-input"
          value={document.title}
          onChange={(event) => setTitle(event.target.value)}
          aria-label="文档标题"
        />
      </div>

      <div className="cm-toolbar__group" aria-label="插入" ref={insertGroupRef}>
        <button type="button" className="cm-button" onClick={handleInsertDrawnixBlock} data-roving-item>
          插入白板块
        </button>
        <PaginationMarkerMenu />
      </div>

      <div className="cm-toolbar__group" aria-label="主题切换">
        <label className="cm-field" htmlFor="editor-theme" style={{ flexDirection: 'row' }}>
          <span>编辑主题</span>
          <select
            id="editor-theme"
            className="cm-select"
            value={document.themes.editor}
            onChange={(event) => setThemes({ editor: event.target.value })}
          >
            {editorThemes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        </label>
        <label className="cm-field" htmlFor="export-theme" style={{ flexDirection: 'row' }}>
          <span>导出主题</span>
          <select
            id="export-theme"
            className="cm-select"
            value={document.themes.export}
            onChange={(event) => setThemes({ export: event.target.value })}
          >
            {exportThemes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="cm-toolbar__group" aria-label="导出操作" ref={exportGroupRef}>
        <button type="button" className="cm-button" onClick={handleExportStandard} data-roving-item>
          标准 HTML
        </button>
        <button type="button" className="cm-button" onClick={handleExportWechat} data-roving-item>
          公众号 HTML
        </button>
      </div>
    </header>
  );
};
