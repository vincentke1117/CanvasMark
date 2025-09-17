import { DRAWNIX_PLACEHOLDER_LINE } from '../blocks/drawnixPlaceholders';

export type PaginationMarkerId =
  | 'page-break'
  | 'section-break'
  | 'no-break-start'
  | 'no-break-end'
  | 'keep-with-next'
  | 'keep-with-previous'
  | 'page-top'
  | 'page-bottom';

export type PaginationMarkerCondition = 'odd' | 'even';

export interface PaginationMarkerDefinition {
  id: PaginationMarkerId;
  label: string;
  description: string;
  allowCondition?: boolean;
}

export interface PaginationMarkerOption {
  id: PaginationMarkerId;
  condition?: PaginationMarkerCondition;
  label: string;
  description: string;
}

export interface ParsedPaginationMarker {
  id: PaginationMarkerId;
  condition?: PaginationMarkerCondition;
}

export const PAGINATION_MARKERS: PaginationMarkerDefinition[] = [
  {
    id: 'page-break',
    label: '分页符',
    description: '强制换到新页或新图片，支持奇/偶页对齐。',
    allowCondition: true,
  },
  {
    id: 'section-break',
    label: '分段符',
    description: '优先切分导出图片，PDF 中可配置是否换页。',
  },
  {
    id: 'no-break-start',
    label: '禁止分页（开始）',
    description: '与结束标记配对，包裹内容不可拆分。',
  },
  {
    id: 'no-break-end',
    label: '禁止分页（结束）',
    description: '与开始标记配对，包裹内容不可拆分。',
  },
  {
    id: 'keep-with-next',
    label: '与下一块同页',
    description: '当前块与下一块保持在同一页/图。',
  },
  {
    id: 'keep-with-previous',
    label: '与上一块同页',
    description: '当前块与上一块保持在同一页/图。',
  },
  {
    id: 'page-top',
    label: '优先置顶',
    description: '尽量将下一块放置在页首/图首。',
  },
  {
    id: 'page-bottom',
    label: '优先置底',
    description: '尽量将下一块放置在页尾/图尾。',
  },
];

const markerMap = new Map<PaginationMarkerId, PaginationMarkerDefinition>(
  PAGINATION_MARKERS.map((marker) => [marker.id, marker]),
);

export const getPaginationMarker = (id: PaginationMarkerId) => markerMap.get(id);

export const buildPaginationMarkerLine = (
  id: PaginationMarkerId,
  condition?: PaginationMarkerCondition,
): string => {
  if (condition) {
    return `{{${id}:${condition}}}`;
  }

  return `{{${id}}}`;
};

const MARKER_IDS_PATTERN = PAGINATION_MARKERS.map((marker) => marker.id).join('|');

const PAGINATION_MARKER_LINE = new RegExp(
  String.raw`^\s*\{\{\s*(${MARKER_IDS_PATTERN})(?::([a-zA-Z0-9_-]+))?\s*\}\}\s*$`,
  'i',
);

export const parsePaginationMarker = (
  text: string,
): ParsedPaginationMarker | null => {
  const match = text.match(PAGINATION_MARKER_LINE);
  if (!match) return null;

  const id = match[1].toLowerCase() as PaginationMarkerId;
  if (!markerMap.has(id)) return null;

  const definition = markerMap.get(id)!;
  const conditionRaw = match[2]?.toLowerCase();
  if (!conditionRaw) {
    return { id };
  }

  if (!definition.allowCondition) {
    return { id };
  }

  if (conditionRaw === 'odd' || conditionRaw === 'even') {
    return { id, condition: conditionRaw };
  }

  return { id };
};

export const describePaginationMarker = (
  marker: ParsedPaginationMarker,
): string => {
  const definition = markerMap.get(marker.id);
  if (!definition) return '分页标记';

  if (marker.condition) {
    const conditionLabel = marker.condition === 'odd' ? '奇数页' : '偶数页';
    return `${definition.label} · ${conditionLabel}`;
  }

  return definition.label;
};

export const isDrawnixPlaceholderLine = (line: string) =>
  DRAWNIX_PLACEHOLDER_LINE.test(line);

export const isPaginationMarkerLine = (line: string) => {
  if (isDrawnixPlaceholderLine(line)) {
    return false;
  }

  return PAGINATION_MARKER_LINE.test(line);
};

export const stripPaginationMarkers = (markdown: string): string => {
  return markdown
    .split(/\r?\n/)
    .filter((line) => !isPaginationMarkerLine(line))
    .join('\n');
};

export const buildPaginationMarkerOptions = (): PaginationMarkerOption[] => {
  const options: PaginationMarkerOption[] = [];

  PAGINATION_MARKERS.forEach((marker) => {
    if (marker.allowCondition) {
      options.push({
        id: marker.id,
        label: `${marker.label}（普通）`,
        description: marker.description,
      });
      options.push({
        id: marker.id,
        condition: 'odd',
        label: `${marker.label}（奇数页对齐）`,
        description: `${marker.description} · 奇数页对齐。`,
      });
      options.push({
        id: marker.id,
        condition: 'even',
        label: `${marker.label}（偶数页对齐）`,
        description: `${marker.description} · 偶数页对齐。`,
      });
    } else {
      options.push({
        id: marker.id,
        label: marker.label,
        description: marker.description,
      });
    }
  });

  return options;
};

export const serializePaginationOptionValue = (
  option: PaginationMarkerOption,
): string => {
  return option.condition ? `${option.id}:${option.condition}` : option.id;
};

export const parsePaginationOptionValue = (
  value: string,
): ParsedPaginationMarker | null => {
  const result = parsePaginationMarker(`{{${value}}}`);
  if (!result) return null;
  return result;
};
