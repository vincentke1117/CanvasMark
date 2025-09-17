import { create } from 'zustand';
import type { Ctx } from '@milkdown/ctx';
import {
  commandsCtx,
  editorStateCtx,
  editorViewCtx,
  schemaCtx,
} from '@milkdown/core';
import type { MarkType, NodeType } from '@milkdown/prose/model';
import type { EditorState } from '@milkdown/prose/state';
import {
  createCodeBlockCommand,
  setBlockTypeCommand,
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleStrongCommand,
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInHeadingCommand,
  wrapInOrderedListCommand,
} from '@milkdown/preset-commonmark';
import {
  insertTableCommand,
  toggleStrikethroughCommand,
} from '@milkdown/preset-gfm';
import type { $Command } from '@milkdown/utils';

type InlineActiveState = {
  bold: boolean;
  italic: boolean;
  strike: boolean;
  inlineCode: boolean;
};

type BlockActiveState = {
  paragraph: boolean;
  heading1: boolean;
  heading2: boolean;
  heading3: boolean;
  blockquote: boolean;
  codeBlock: boolean;
  bulletList: boolean;
  orderedList: boolean;
};

type CommandAvailability = {
  bold: boolean;
  italic: boolean;
  strike: boolean;
  inlineCode: boolean;
  paragraph: boolean;
  heading1: boolean;
  heading2: boolean;
  heading3: boolean;
  blockquote: boolean;
  codeBlock: boolean;
  bulletList: boolean;
  orderedList: boolean;
  table: boolean;
};

type FormattingState = {
  marks: InlineActiveState;
  blocks: BlockActiveState;
  availability: CommandAvailability;
};

const initialState: FormattingState = {
  marks: {
    bold: false,
    italic: false,
    strike: false,
    inlineCode: false,
  },
  blocks: {
    paragraph: false,
    heading1: false,
    heading2: false,
    heading3: false,
    blockquote: false,
    codeBlock: false,
    bulletList: false,
    orderedList: false,
  },
  availability: {
    bold: false,
    italic: false,
    strike: false,
    inlineCode: false,
    paragraph: false,
    heading1: false,
    heading2: false,
    heading3: false,
    blockquote: false,
    codeBlock: false,
    bulletList: false,
    orderedList: false,
    table: false,
  },
};

export const useFormattingState = create<FormattingState>(() => initialState);

const isMarkActive = (state: EditorState, type: MarkType | null | undefined) => {
  if (!type) return false;
  const { from, to, empty } = state.selection;
  if (empty) {
    return !!type.isInSet(state.storedMarks ?? state.selection.$from.marks());
  }

  return state.doc.rangeHasMark(from, to, type);
};

const hasParentNodeOfType = (state: EditorState, type: NodeType | null | undefined) => {
  if (!type) return false;
  const { $from, $to } = state.selection;

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type === type) {
      return true;
    }
  }

  if ($from.pos === $to.pos) {
    return false;
  }

  for (let depth = $to.depth; depth > 0; depth -= 1) {
    if ($to.node(depth).type === type) {
      return true;
    }
  }

  return false;
};

const getHeadingLevelActive = (state: EditorState, headingType: NodeType | null | undefined, level: number) => {
  if (!headingType) return false;
  const { $from } = state.selection;
  return $from.parent.type === headingType && $from.parent.attrs.level === level;
};

const canRunCommand = <T,>(ctx: Ctx, command: $Command<T>, payload?: T) => {
  try {
    const manager = ctx.get(commandsCtx);
    const view = ctx.get(editorViewCtx);
    const state = ctx.get(editorStateCtx);
    const runner = manager.get(command.key);
    const pmCommand = runner(payload);
    return pmCommand(state, undefined, view) ?? false;
  } catch (error) {
    console.warn('[CanvasMark] command availability check failed', error);
    return false;
  }
};

const canSetBlockType = (ctx: Ctx, nodeType: NodeType | null | undefined) => {
  if (!nodeType) return false;
  return canRunCommand(ctx, setBlockTypeCommand, { nodeType });
};

const canWrapHeading = (ctx: Ctx, level: number, headingType: NodeType | null | undefined) => {
  if (!headingType) return false;
  return canRunCommand(ctx, wrapInHeadingCommand, level);
};

const canWrapNode = (ctx: Ctx, command: $Command<unknown>) => canRunCommand(ctx, command);

const canInsertTable = (ctx: Ctx) => canRunCommand(ctx, insertTableCommand, { row: 3, col: 4 });

const computeFormattingState = (ctx: Ctx): FormattingState => {
  try {
    const state = ctx.get(editorStateCtx);
    const schema = ctx.get(schemaCtx);

    const marks: InlineActiveState = {
      bold: isMarkActive(state, schema.marks.strong ?? null),
      italic: isMarkActive(state, schema.marks.em ?? null),
      strike: isMarkActive(state, schema.marks.strike_through ?? null),
      inlineCode: isMarkActive(state, schema.marks.code_inline ?? schema.marks.code ?? null),
    };

    const { $from } = state.selection;
    const parent = $from.parent;

    const blocks: BlockActiveState = {
      paragraph: parent.type === schema.nodes.paragraph,
      heading1: getHeadingLevelActive(state, schema.nodes.heading ?? null, 1),
      heading2: getHeadingLevelActive(state, schema.nodes.heading ?? null, 2),
      heading3: getHeadingLevelActive(state, schema.nodes.heading ?? null, 3),
      blockquote: hasParentNodeOfType(state, schema.nodes.blockquote ?? null),
      codeBlock: parent.type === schema.nodes.code_block,
      bulletList: hasParentNodeOfType(state, schema.nodes.bullet_list ?? null),
      orderedList: hasParentNodeOfType(state, schema.nodes.ordered_list ?? null),
    };

    const availability: CommandAvailability = {
      bold: canRunCommand(ctx, toggleStrongCommand),
      italic: canRunCommand(ctx, toggleEmphasisCommand),
      strike: canRunCommand(ctx, toggleStrikethroughCommand),
      inlineCode: canRunCommand(ctx, toggleInlineCodeCommand),
      paragraph: canSetBlockType(ctx, schema.nodes.paragraph ?? null),
      heading1: canWrapHeading(ctx, 1, schema.nodes.heading ?? null),
      heading2: canWrapHeading(ctx, 2, schema.nodes.heading ?? null),
      heading3: canWrapHeading(ctx, 3, schema.nodes.heading ?? null),
      blockquote: canWrapNode(ctx, wrapInBlockquoteCommand),
      codeBlock: canRunCommand(ctx, createCodeBlockCommand),
      bulletList: canWrapNode(ctx, wrapInBulletListCommand),
      orderedList: canWrapNode(ctx, wrapInOrderedListCommand),
      table: canInsertTable(ctx),
    };

    return {
      marks,
      blocks,
      availability,
    };
  } catch (error) {
    console.warn('[CanvasMark] formatting state compute failed', error);
    return initialState;
  }
};

export const updateFormattingState = (ctx: Ctx) => {
  const next = computeFormattingState(ctx);
  useFormattingState.setState(next);
};

export const resetFormattingState = () => {
  useFormattingState.setState(initialState);
};
