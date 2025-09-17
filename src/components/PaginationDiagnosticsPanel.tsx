import { useMemo } from 'react';
import { useDocumentStore } from '../modules/documents/documentStore';
import {
  analyzePaginationMarkers,
  summarizePaginationMarker,
} from '../modules/pagination/paginationDiagnostics';

export const PaginationDiagnosticsPanel = () => {
  const content = useDocumentStore((state) => state.document.content);

  const diagnostics = useMemo(() => analyzePaginationMarkers(content), [content]);

  const hasMarkers = diagnostics.markers.length > 0;
  const hasInlineIssues = diagnostics.inlineIssues.length > 0;

  return (
    <section className="cm-panel" aria-label="分页标记诊断">
      <header className="cm-panel__header">分页标记诊断</header>
      {!hasMarkers && !hasInlineIssues ? (
        <p>未检测到分页或分段标记。</p>
      ) : (
        <div className="cm-diagnostics">
          {hasMarkers && (
            <ol className="cm-diagnostics__list" aria-label="已插入的标记">
              {diagnostics.markers.map((entry) => (
                <li key={`${entry.line}-${entry.text}`} className="cm-diagnostics__item">
                  <div className="cm-diagnostics__summary">
                    <span className="cm-diagnostics__marker">{summarizePaginationMarker(entry)}</span>
                    <span className="cm-diagnostics__meta">第 {entry.line} 行</span>
                  </div>
                  {entry.issues.length > 0 ? (
                    <ul className="cm-diagnostics__issues">
                      {entry.issues.map((issue, index) => (
                        <li key={`${issue.type}-${index}`} className={`cm-diagnostics__issue cm-diagnostics__issue--${issue.severity}`}>
                          {issue.message}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="cm-diagnostics__status">已通过配对校验。</p>
                  )}
                </li>
              ))}
            </ol>
          )}

          {hasInlineIssues && (
            <div className="cm-diagnostics__inline" role="group" aria-label="格式错误">
              <p className="cm-diagnostics__inline-title">格式问题</p>
              <ul className="cm-diagnostics__issues">
                {diagnostics.inlineIssues.map((issue, index) => (
                  <li key={`${issue.type}-${issue.line}-${index}`} className={`cm-diagnostics__issue cm-diagnostics__issue--${issue.severity}`}>
                    第 {issue.line} 行：{issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
