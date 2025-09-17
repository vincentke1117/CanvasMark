import {
  PAGINATION_MARKERS,
  describePaginationMarker,
  parsePaginationMarker,
  type PaginationMarkerId,
  type PaginationMarkerCondition,
  type ParsedPaginationMarker,
} from './paginationMarkers';

export type PaginationIssueType =
  | 'no-break-missing-end'
  | 'no-break-missing-start'
  | 'no-break-nesting'
  | 'inline-marker';

export type PaginationIssueSeverity = 'error' | 'warning';

export interface PaginationMarkerIssue {
  line: number;
  message: string;
  type: PaginationIssueType;
  severity: PaginationIssueSeverity;
  markerId?: PaginationMarkerId;
  relatedLine?: number;
  condition?: PaginationMarkerCondition;
}

export interface PaginationMarkerEntry {
  line: number;
  text: string;
  marker: ParsedPaginationMarker;
  pairedLine?: number;
  issues: PaginationMarkerIssue[];
}

export interface PaginationDiagnostics {
  markers: PaginationMarkerEntry[];
  inlineIssues: PaginationMarkerIssue[];
  hasError: boolean;
}

const markerIdPattern = PAGINATION_MARKERS.map((marker) => marker.id).join('|');
const inlineMarkerPattern = new RegExp(
  String.raw`\{\{\s*(?:${markerIdPattern})(?::[a-zA-Z0-9_-]+)?\s*\}\}`,
  'i',
);

const attachIssue = (
  entry: PaginationMarkerEntry,
  issue: Omit<PaginationMarkerIssue, 'line' | 'markerId' | 'condition'>,
) => {
  const fullIssue: PaginationMarkerIssue = {
    line: entry.line,
    markerId: entry.marker.id,
    condition: entry.marker.condition,
    ...issue,
  };
  entry.issues.push(fullIssue);
  return fullIssue;
};

export const analyzePaginationMarkers = (markdown: string): PaginationDiagnostics => {
  const markers: PaginationMarkerEntry[] = [];
  const inlineIssues: PaginationMarkerIssue[] = [];
  const noBreakStack: PaginationMarkerEntry[] = [];

  const lines = markdown.split(/\r?\n/);

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();
    const parsed = parsePaginationMarker(trimmed);

    if (parsed) {
      const entry: PaginationMarkerEntry = {
        line: lineNumber,
        text: trimmed,
        marker: parsed,
        issues: [],
      };
      markers.push(entry);

      if (parsed.id === 'no-break-start') {
        noBreakStack.push(entry);
        if (noBreakStack.length > 2) {
          attachIssue(entry, {
            type: 'no-break-nesting',
            severity: 'error',
            message: '禁止分页标记的嵌套深度不能超过 2 层。',
          });
        }
      } else if (parsed.id === 'no-break-end') {
        const start = noBreakStack.pop();
        if (!start) {
          attachIssue(entry, {
            type: 'no-break-missing-start',
            severity: 'error',
            message: '检测到未匹配的 {{no-break-end}}，请补充对应的开始标记。',
          });
        } else {
          start.pairedLine = entry.line;
          entry.pairedLine = start.line;
        }
      }
      return;
    }

    if (inlineMarkerPattern.test(line) && trimmed !== '') {
      inlineIssues.push({
        line: lineNumber,
        type: 'inline-marker',
        severity: 'error',
        message: '分页标记需要独占一行，请移除同行的其他文本。',
      });
    }
  });

  while (noBreakStack.length > 0) {
    const start = noBreakStack.pop()!;
    attachIssue(start, {
      type: 'no-break-missing-end',
      severity: 'error',
      message: '检测到缺少 {{no-break-end}}，请补充对应的结束标记。',
    });
  }

  const hasError =
    markers.some((entry) => entry.issues.some((issue) => issue.severity === 'error')) ||
    inlineIssues.some((issue) => issue.severity === 'error');

  return { markers, inlineIssues, hasError };
};

export const summarizePaginationMarker = (entry: PaginationMarkerEntry) => {
  const label = describePaginationMarker(entry.marker);
  if (entry.pairedLine) {
    return `${label} · 配对行：${entry.pairedLine}`;
  }
  return label;
};
