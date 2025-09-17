import { useEditorTheme } from './hooks/useEditorTheme';
import { Toolbar } from './components/Toolbar';
import { MarkdownEditor } from './modules/editor/MarkdownEditor';
import { PropertiesPanel } from './components/PropertiesPanel';
import { StatusBar } from './components/StatusBar';
import { DrawnixEditorOverlay } from './components/DrawnixEditorOverlay';

const App = () => {
  useEditorTheme();

  return (
    <div className="cm-app">
      <Toolbar />
      <main className="cm-layout">
        <section className="cm-editor" aria-label="Markdown 编辑区">
          <div className="cm-editor__container">
            <MarkdownEditor />
          </div>
        </section>
        <PropertiesPanel />
      </main>
      <StatusBar />
      <DrawnixEditorOverlay />
    </div>
  );
};

export default App;
