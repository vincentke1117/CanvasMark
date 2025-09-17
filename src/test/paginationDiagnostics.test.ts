import { describe, expect, it } from 'vitest';
import { analyzePaginationMarkers } from '../modules/pagination/paginationDiagnostics';

const analyse = (markdown: string) => analyzePaginationMarkers(markdown.trim());

describe('analyzePaginationMarkers', () => {
  it('collects markers and pairs no-break blocks', () => {
    const diagnostics = analyse(`
      {{page-break}}

      {{no-break-start}}
      段落内容
      {{no-break-end}}
    `);

    expect(diagnostics.markers).toHaveLength(3);
    const noBreakStart = diagnostics.markers.find((entry) => entry.marker.id === 'no-break-start');
    const noBreakEnd = diagnostics.markers.find((entry) => entry.marker.id === 'no-break-end');

    expect(noBreakStart?.pairedLine).toBe(noBreakEnd?.line);
    expect(noBreakEnd?.pairedLine).toBe(noBreakStart?.line);
    expect(noBreakStart?.issues).toHaveLength(0);
    expect(noBreakEnd?.issues).toHaveLength(0);
    expect(diagnostics.hasError).toBe(false);
  });

  it('reports missing no-break end marker', () => {
    const diagnostics = analyse(`
      {{no-break-start}}
      内容
    `);

    const start = diagnostics.markers[0];
    expect(start.issues).toHaveLength(1);
    expect(start.issues[0].type).toBe('no-break-missing-end');
    expect(diagnostics.hasError).toBe(true);
  });

  it('reports unexpected no-break end marker', () => {
    const diagnostics = analyse(`
      {{no-break-end}}
    `);

    const end = diagnostics.markers[0];
    expect(end.issues[0].type).toBe('no-break-missing-start');
    expect(diagnostics.hasError).toBe(true);
  });

  it('reports excessive nesting depth', () => {
    const diagnostics = analyse(`
      {{no-break-start}}
      {{no-break-start}}
      {{no-break-start}}
      {{no-break-end}}
      {{no-break-end}}
      {{no-break-end}}
    `);

    const thirdStart = diagnostics.markers.filter((entry) => entry.marker.id === 'no-break-start')[2];
    expect(thirdStart.issues[0].type).toBe('no-break-nesting');
    expect(diagnostics.hasError).toBe(true);
  });

  it('reports inline marker usage', () => {
    const diagnostics = analyse('正文 {{page-break}} 内容');

    expect(diagnostics.inlineIssues).toHaveLength(1);
    expect(diagnostics.inlineIssues[0].type).toBe('inline-marker');
    expect(diagnostics.hasError).toBe(true);
  });
});
