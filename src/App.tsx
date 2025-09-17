import { useEditorTheme } from './hooks/useEditorTheme';
import { Toolbar } from './components/Toolbar';
import { FormattingRibbon } from './components/FormattingRibbon';
import { MarkdownEditor } from './modules/editor/MarkdownEditor';
import { PropertiesPanel } from './components/PropertiesPanel';
import { StatusBar } from './components/StatusBar';

const App = () => {
  useEditorTheme();

  return (
    <div className="cm-app">
      <Toolbar />
      <main className="cm-layout">
        <section className="cm-editor" aria-label="Markdown 编辑区">
          <div className="cm-editor__container">
            <FormattingRibbon />
            <div style={{ marginTop: '1rem' }}>
              <MarkdownEditor />
            </div>
          </div>
        </section>
        <PropertiesPanel />
      </main>
      <StatusBar />
    </div>
  );
};

export default App;
