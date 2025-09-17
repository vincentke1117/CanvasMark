import { useEffect, useRef } from 'react';
import {
  Editor,
  defaultValueCtx,
  editorStateCtx,
  editorViewCtx,
  rootCtx,
  schemaCtx,
} from '@milkdown/core';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { nord } from '@milkdown/theme-nord';
import { history } from '@milkdown/plugin-history';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { replaceAll } from '@milkdown/utils';
import { FormattingRibbon } from '../../components/FormattingRibbon';
import { useDocumentStore } from '../documents/documentStore';
import { resetFormattingState, updateFormattingState } from './formattingState';
import { editorBus } from './editorBus';
import { drawnixPlaceholderPlugin } from './plugins/drawnixPlaceholder';
import { paginationMarkerPlugin } from './plugins/paginationMarker';
import { buildDrawnixPlaceholder } from '../blocks/drawnixPlaceholders';

const EditorInner = () => {
  const content = useDocumentStore((state) => state.document.content);
  const documentId = useDocumentStore((state) => state.document.id);
  const setContent = useDocumentStore((state) => state.setContent);
  const initialContent = useRef(content);

  const { get } = useEditor(
    (root) =>
      Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, initialContent.current);
        })
        .use((ctx) => {
          nord(ctx);
          return () => {};
        })
        .use(commonmark)
        .use(gfm)
        .use(history)
        .use(listener)
        .use(drawnixPlaceholderPlugin)
        .use(paginationMarkerPlugin)
        .config((ctx) => {
          const manager = ctx.get(listenerCtx);
          manager.markdownUpdated((_, markdown) => {
            setContent(markdown);
          });
          manager.mounted((innerCtx) => {
            updateFormattingState(innerCtx);
          });
          manager.selectionUpdated((innerCtx) => {
            updateFormattingState(innerCtx);
          });
          manager.updated((innerCtx) => {
            updateFormattingState(innerCtx);
          });
          manager.destroy(() => {
            resetFormattingState();
          });
        }),
    [setContent],
  );

  useEffect(() => {
    initialContent.current = content;
  }, [documentId, content]);

  useEffect(() => {
    const instance = get();
    if (!instance) return;
    instance.action(replaceAll(content));
  }, [documentId, content, get]);

  useEffect(() => {
    const handler = ({ blockId }: { blockId: string }) => {
      const editor = get();
      if (!editor) return;

      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        const state = ctx.get(editorStateCtx);
        const schema = ctx.get(schemaCtx);
        const paragraphType = schema.nodes.paragraph;
        if (!paragraphType) return;

        const placeholderNode = paragraphType.create(
          undefined,
          schema.text(buildDrawnixPlaceholder(blockId)),
        );
        if (!placeholderNode) return;

        let transaction = state.tr.replaceSelectionWith(placeholderNode);
        const trailing = paragraphType.createAndFill();
        if (trailing) {
          const insertPos = transaction.selection.from + placeholderNode.nodeSize;
          transaction = transaction.insert(insertPos, trailing);
        }

        view.dispatch(transaction.scrollIntoView());
        view.focus();
      });
    };

    editorBus.on('insert:drawnix-block', handler);

    return () => {
      editorBus.off('insert:drawnix-block', handler);
    };
  }, [get]);

  return (
    <div className="cm-editor__surface">
      <FormattingRibbon />
      <Milkdown />
    </div>
  );
};

export const MarkdownEditor = () => {
  return (
    <MilkdownProvider>
      <EditorInner />
    </MilkdownProvider>
  );
};
