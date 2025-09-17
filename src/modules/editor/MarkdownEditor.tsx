import { useEffect, useRef } from 'react';
import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { nord } from '@milkdown/theme-nord';
import { history } from '@milkdown/plugin-history';
import { commonmark } from '@milkdown/preset-commonmark';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { replaceAll } from '@milkdown/utils';
import { useDocumentStore } from '../documents/documentStore';

const MilkdownEditor = () => {
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
        .use(history)
        .use(listener)
        .config((ctx) => {
          ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
            setContent(markdown);
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

  return <Milkdown />;
};

export const MarkdownEditor = () => {
  return (
    <MilkdownProvider>
      <MilkdownEditor />
    </MilkdownProvider>
  );
};
