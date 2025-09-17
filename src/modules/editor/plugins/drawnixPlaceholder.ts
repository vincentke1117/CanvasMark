import { $prose } from '@milkdown/utils';
import { Plugin, PluginKey } from '@milkdown/prose/state';
import { Decoration, DecorationSet } from '@milkdown/prose/view';
import type { Node as ProseNode } from '@milkdown/prose/model';
import { extractDrawnixPlaceholderId } from '../../blocks/drawnixPlaceholders';

const pluginKey = new PluginKey<DecorationSet>('canvasmark-drawnix-placeholder');

const createDecorations = (doc: ProseNode) => {
  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    if (node.type.name !== 'paragraph') return;
    const blockId = extractDrawnixPlaceholderId(node.textContent ?? '');
    if (!blockId) return;

    decorations.push(
      Decoration.node(pos, pos + node.nodeSize, {
        class: 'cm-drawnix-placeholder',
        'data-block-id': blockId,
        role: 'group',
        'aria-label': `Drawnix 块占位符 ${blockId}`,
      }),
    );
  });

  return DecorationSet.create(doc, decorations);
};

export const drawnixPlaceholderPlugin = $prose(() =>
  new Plugin({
    key: pluginKey,
    state: {
      init: (_, state) => createDecorations(state.doc),
      apply: (tr, value) => {
        if (tr.docChanged) {
          return createDecorations(tr.doc);
        }

        return value.map(tr.mapping, tr.doc);
      },
    },
    props: {
      decorations: (state) => pluginKey.getState(state) ?? DecorationSet.empty,
    },
  }),
);
