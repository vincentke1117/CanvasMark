import { $prose } from '@milkdown/utils';
import { Plugin, PluginKey } from '@milkdown/prose/state';
import { Decoration, DecorationSet } from '@milkdown/prose/view';
import type { Node as ProseNode } from '@milkdown/prose/model';
import { extractDrawnixPlaceholderId } from '../../blocks/drawnixPlaceholders';
import type { DrawnixBlockSnapshot } from '../../documents/types';
import { useDocumentStore } from '../../documents/documentStore';
import { editorBus } from '../editorBus';

const pluginKey = new PluginKey<DecorationSet>('canvasmark-drawnix-placeholder');

const createPreviewWidget = (blockId: string, block?: DrawnixBlockSnapshot) => {
  const container = document.createElement('div');
  container.className = 'cm-drawnix-widget';
  container.setAttribute('data-block-id', blockId);
  container.setAttribute('contenteditable', 'false');
  container.tabIndex = 0;

  const preview = document.createElement('div');
  preview.className = 'cm-drawnix-widget__preview';

  if (block?.preview) {
    const img = document.createElement('img');
    img.src = block.preview;
    img.alt = block.description || `Drawnix 白板 ${blockId}`;
    img.loading = 'lazy';
    preview.appendChild(img);
  } else {
    const fallback = document.createElement('div');
    fallback.className = 'cm-drawnix-widget__empty';
    fallback.textContent = '尚未绘制内容。点击“编辑白板”开始创作。';
    preview.appendChild(fallback);
  }

  const footer = document.createElement('div');
  footer.className = 'cm-drawnix-widget__footer';

  const label = document.createElement('span');
  label.className = 'cm-drawnix-widget__label';
  label.textContent = block?.description?.trim() || `Drawnix 块 ${blockId}`;
  footer.appendChild(label);

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'cm-button cm-button--ghost cm-button--small';
  editButton.textContent = '编辑白板';
  editButton.addEventListener('mousedown', (event) => {
    event.preventDefault();
  });
  editButton.addEventListener('click', (event) => {
    event.preventDefault();
    editorBus.emit('drawnix:open-editor', { blockId });
  });
  footer.appendChild(editButton);

  container.addEventListener('dblclick', (event) => {
    event.preventDefault();
    editorBus.emit('drawnix:open-editor', { blockId });
  });

  container.appendChild(preview);
  container.appendChild(footer);

  return container;
};

const createDecorations = (
  doc: ProseNode,
  blocks: Record<string, DrawnixBlockSnapshot>,
) => {
  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    if (node.type.name !== 'paragraph') return;
    const blockId = extractDrawnixPlaceholderId(node.textContent ?? '');
    if (!blockId) return;

    const block = blocks[blockId];


    decorations.push(
      Decoration.node(pos, pos + node.nodeSize, {
        class: 'cm-drawnix-placeholder',
        'data-block-id': blockId,

        'data-preview-state': block?.preview ? 'ready' : 'empty',
      }),
    );

    decorations.push(
      Decoration.widget(pos + 1, () => createPreviewWidget(blockId, block), {
        key: `drawnix:${blockId}`,

      }),
    );
  });

  return DecorationSet.create(doc, decorations);
};

export const drawnixPlaceholderPlugin = $prose(() =>
  new Plugin({
    key: pluginKey,
    state: {

      init: (_, state) =>
        createDecorations(state.doc, useDocumentStore.getState().document.blocks),
      apply: (tr, value, _oldState, newState) => {
        const refreshedBlocks = tr.getMeta(pluginKey) as
          | Record<string, DrawnixBlockSnapshot>
          | undefined;

        if (refreshedBlocks) {
          return createDecorations(newState.doc, refreshedBlocks);
        }

        if (tr.docChanged) {
          return createDecorations(tr.doc, useDocumentStore.getState().document.blocks);

        }

        return value.map(tr.mapping, tr.doc);
      },
    },
    props: {
      decorations: (state) => pluginKey.getState(state) ?? DecorationSet.empty,
    },

    view: (view) => {
      let previousBlocks = useDocumentStore.getState().document.blocks;
      const unsubscribe = useDocumentStore.subscribe((state) => {
        const blocks = state.document.blocks;
        if (blocks === previousBlocks) return;
        previousBlocks = blocks;
        const transaction = view.state.tr.setMeta(pluginKey, blocks);
        view.dispatch(transaction);
      });

      return {
        destroy: () => {
          unsubscribe();
        },
      };
    },

  }),
);
