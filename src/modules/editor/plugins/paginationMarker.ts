import { $prose } from '@milkdown/utils';
import { Plugin, PluginKey } from '@milkdown/prose/state';
import { Decoration, DecorationSet } from '@milkdown/prose/view';
import type { Node as ProseNode } from '@milkdown/prose/model';
import {
  describePaginationMarker,
  parsePaginationMarker,
} from '../../pagination/paginationMarkers';

const pluginKey = new PluginKey<DecorationSet>('canvasmark-pagination-marker');

const createDecorations = (doc: ProseNode) => {
  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    if (node.type.name !== 'paragraph') return;
    const marker = parsePaginationMarker(node.textContent ?? '');
    if (!marker) return;

    const classes = ['cm-pagination-marker', `cm-pagination-marker--${marker.id}`];
    if (marker.condition) {
      classes.push(`cm-pagination-marker--${marker.condition}`);
    }

    const label = describePaginationMarker(marker);

    decorations.push(
      Decoration.node(pos, pos + node.nodeSize, {
        class: classes.join(' '),
        role: 'note',
        'aria-label': label,
        'data-marker-id': marker.id,
        'data-marker-condition': marker.condition ?? '',
        'data-marker-label': label,
      }),
    );
  });

  return DecorationSet.create(doc, decorations);
};

export const paginationMarkerPlugin = $prose(() =>
  new Plugin({
    key: pluginKey,
    state: {
      init: (_, state) => createDecorations(state.doc),
      apply: (tr, value, oldState, newState) => {
        if (tr.docChanged || newState !== oldState) {
          return createDecorations(newState.doc);
        }

        return value.map(tr.mapping, tr.doc);
      },
    },
    props: {
      decorations: (state) => pluginKey.getState(state) ?? DecorationSet.empty,
    },
  }),
);
