import { describe, expect, it } from 'vitest';
import {
  buildPaginationMarkerLine,
  parsePaginationMarker,
  stripPaginationMarkers,
} from '../modules/pagination/paginationMarkers';

describe('pagination markers utilities', () => {
  it('builds marker lines with optional condition', () => {
    expect(buildPaginationMarkerLine('page-break')).toBe('{{page-break}}');
    expect(buildPaginationMarkerLine('page-break', 'odd')).toBe('{{page-break:odd}}');
  });

  it('parses marker lines with tolerant whitespace', () => {
    expect(parsePaginationMarker('{{ page-break }}')).toEqual({ id: 'page-break' });
    expect(parsePaginationMarker(' {{page-break:even}} ')).toEqual({ id: 'page-break', condition: 'even' });
    expect(parsePaginationMarker('{{keep-with-next}}')).toEqual({ id: 'keep-with-next' });
    expect(parsePaginationMarker('{{unknown}}')).toBeNull();
  });

  it('strips marker-only lines but keeps regular content', () => {
    const markdown = [
      '# Title',
      '',
      '{{page-break}}',
      '正文内容',
      '{{ drawnix:block-1 }}',
      '{{ keep-with-next }}',
      '更多内容',
    ].join('\n');

    expect(stripPaginationMarkers(markdown)).toBe(
      ['# Title', '', '正文内容', '{{ drawnix:block-1 }}', '更多内容'].join('\n'),
    );
  });
});
