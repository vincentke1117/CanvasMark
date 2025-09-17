import { useCallback, useRef } from 'react';
import type { Ctx } from '@milkdown/ctx';
import { commandsCtx, schemaCtx } from '@milkdown/core';
import { useInstance } from '@milkdown/react';
import {
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleStrongCommand,
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInHeadingCommand,
  wrapInOrderedListCommand,
  createCodeBlockCommand,
  setBlockTypeCommand,
} from '@milkdown/preset-commonmark';
import {
  insertTableCommand,
  toggleStrikethroughCommand,
} from '@milkdown/preset-gfm';
import type { $Command } from '@milkdown/utils';
import { useFormattingState } from '../modules/editor/formattingState';
import { useRovingFocus } from '../hooks/useRovingFocus';

const useEditorAction = () => {
  const [loading, get] = useInstance();

  return useCallback(
    (executor: (ctx: Ctx) => void) => {
      if (loading) return;
      const editor = get();
      if (!editor) return;
      editor.action((ctx) => {
        executor(ctx);
      });
    },
    [get, loading],
  );
};

const useCommandRunner = (action: (executor: (ctx: Ctx) => void) => void) => {
  return useCallback(
    <T,>(command: $Command<T>, payload?: T) => {
      action((ctx) => {
        ctx.get(commandsCtx).call(command.key, payload);
      });
    },
    [action],
  );
};

type CommandButtonProps = {
  label: string;
  shortcut?: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  toggle?: boolean;
};

const CommandButton = ({
  label,
  shortcut,
  onClick,
  active = false,
  disabled = false,
  toggle = true,
}: CommandButtonProps) => {
  const title = shortcut ? `${label}（${shortcut}）` : label;
  const className = [
    'cm-button',
    'cm-button--ghost',
    active && toggle ? 'cm-button--active' : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={toggle ? active : undefined}
      disabled={disabled}
      data-roving-item
    >
      <span>{label}</span>
      {shortcut ? <span className="cm-button__shortcut">{shortcut}</span> : null}
    </button>
  );
};

export const FormattingRibbon = () => {
  const runAction = useEditorAction();
  const runCommand = useCommandRunner(runAction);
  const marks = useFormattingState((state) => state.marks);
  const blocks = useFormattingState((state) => state.blocks);
  const availability = useFormattingState((state) => state.availability);

  const inlineGroupRef = useRef<HTMLDivElement | null>(null);
  const blockGroupRef = useRef<HTMLDivElement | null>(null);
  const listGroupRef = useRef<HTMLDivElement | null>(null);

  useRovingFocus(inlineGroupRef, { orientation: 'horizontal' });
  useRovingFocus(blockGroupRef, { orientation: 'horizontal' });
  useRovingFocus(listGroupRef, { orientation: 'horizontal' });

  const applyParagraph = useCallback(() => {
    runAction((ctx) => {
      const schema = ctx.get(schemaCtx);
      ctx.get(commandsCtx).call(setBlockTypeCommand.key, {
        nodeType: schema.nodes.paragraph,
      });
    });
  }, [runAction]);

  const applyHeading = useCallback(
    (level: number) => {
      runCommand(wrapInHeadingCommand, level);
    },
    [runCommand],
  );

  const insertDefaultTable = useCallback(() => {
    runCommand(insertTableCommand, { row: 3, col: 4 });
  }, [runCommand]);

  return (
    <div className="cm-formatting" role="toolbar" aria-label="格式工具栏">
      <div className="cm-formatting__group" role="group" aria-label="文字样式">
        <span className="cm-formatting__label">文字</span>
        <div className="cm-formatting__actions" ref={inlineGroupRef}>
          <CommandButton
            label="粗体"
            shortcut="Ctrl+B"
            onClick={() => runCommand(toggleStrongCommand)}
            active={marks.bold}
            disabled={!availability.bold}
          />
          <CommandButton
            label="斜体"
            shortcut="Ctrl+I"
            onClick={() => runCommand(toggleEmphasisCommand)}
            active={marks.italic}
            disabled={!availability.italic}
          />
          <CommandButton
            label="删除线"
            shortcut="Ctrl+Shift+X"
            onClick={() => runCommand(toggleStrikethroughCommand)}
            active={marks.strike}
            disabled={!availability.strike}
          />
          <CommandButton
            label="行内代码"
            shortcut="Ctrl+E"
            onClick={() => runCommand(toggleInlineCodeCommand)}
            active={marks.inlineCode}
            disabled={!availability.inlineCode}
          />
        </div>
      </div>

      <div className="cm-formatting__group" role="group" aria-label="段落结构">
        <span className="cm-formatting__label">段落</span>
        <div className="cm-formatting__actions" ref={blockGroupRef}>
          <CommandButton
            label="正文"
            onClick={applyParagraph}
            active={blocks.paragraph}
            disabled={!availability.paragraph}
          />
          <CommandButton
            label="标题一"
            onClick={() => applyHeading(1)}
            active={blocks.heading1}
            disabled={!availability.heading1}
          />
          <CommandButton
            label="标题二"
            onClick={() => applyHeading(2)}
            active={blocks.heading2}
            disabled={!availability.heading2}
          />
          <CommandButton
            label="标题三"
            onClick={() => applyHeading(3)}
            active={blocks.heading3}
            disabled={!availability.heading3}
          />
          <CommandButton
            label="引用"
            onClick={() => runCommand(wrapInBlockquoteCommand)}
            active={blocks.blockquote}
            disabled={!availability.blockquote}
          />
          <CommandButton
            label="代码块"
            shortcut="Ctrl+Shift+C"
            onClick={() => runCommand(createCodeBlockCommand)}
            active={blocks.codeBlock}
            disabled={!availability.codeBlock}
          />
        </div>
      </div>

      <div className="cm-formatting__group" role="group" aria-label="列表与表格">
        <span className="cm-formatting__label">列表 / 表格</span>
        <div className="cm-formatting__actions" ref={listGroupRef}>
          <CommandButton
            label="无序列表"
            shortcut="Ctrl+Shift+8"
            onClick={() => runCommand(wrapInBulletListCommand)}
            active={blocks.bulletList}
            disabled={!availability.bulletList}
          />
          <CommandButton
            label="有序列表"
            shortcut="Ctrl+Shift+7"
            onClick={() => runCommand(wrapInOrderedListCommand)}
            active={blocks.orderedList}
            disabled={!availability.orderedList}
          />
          <CommandButton
            label="表格 3×4"
            onClick={insertDefaultTable}
            disabled={!availability.table}
            toggle={false}
          />
        </div>
      </div>
    </div>
  );
};
