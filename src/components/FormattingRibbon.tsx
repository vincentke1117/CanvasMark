export const FormattingRibbon = () => {
  return (
    <div
      role="note"
      aria-label="格式化提示"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.75rem 3rem',
        borderBottom: '1px solid var(--cm-border)',
        backgroundColor: 'var(--cm-surface-variant)',
        position: 'sticky',
        top: 0,
        zIndex: 5,
        fontSize: '0.85rem',
        color: 'rgba(31,31,36,0.7)',
      }}
    >
      <span>提示：可使用常见 Markdown 语法或快捷键进行格式化。</span>
      <span>**Ctrl+B** 粗体 · **Ctrl+I** 斜体 · **Ctrl+Shift+K** 代码块</span>
      <span>输入 `-` / `1.` / `[]` 可快速创建列表与任务列表。</span>
      <span>更多快捷键请参阅顶部“帮助”菜单（后续版本提供）。</span>
    </div>
  );
};
