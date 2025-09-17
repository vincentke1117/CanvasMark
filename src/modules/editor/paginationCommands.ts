import type { Ctx } from '@milkdown/ctx';
import { editorStateCtx, editorViewCtx, schemaCtx } from '@milkdown/core';
import { TextSelection } from '@milkdown/prose/state';
import {
  PaginationMarkerCondition,
  PaginationMarkerId,
  buildPaginationMarkerLine,
} from '../pagination/paginationMarkers';

export const insertPaginationMarker = (
  ctx: Ctx,
  id: PaginationMarkerId,
  condition?: PaginationMarkerCondition,
) => {
  const view = ctx.get(editorViewCtx);
  const state = ctx.get(editorStateCtx);
  const schema = ctx.get(schemaCtx);
  const paragraphType = schema.nodes.paragraph;
  if (!paragraphType) return;

  const text = buildPaginationMarkerLine(id, condition);
  const textNode = schema.text(text);
  if (!textNode) return;

  const markerParagraph = paragraphType.create(undefined, textNode);
  if (!markerParagraph) return;

  let transaction = state.tr.replaceSelectionWith(markerParagraph, false);
  const markerStart = transaction.selection.from - markerParagraph.nodeSize;
  const insertPos = markerStart + markerParagraph.nodeSize;

  const trailingParagraph = paragraphType.createAndFill();
  if (trailingParagraph) {
    transaction = transaction.insert(insertPos, trailingParagraph);
    transaction = transaction.setSelection(
      TextSelection.create(transaction.doc, insertPos + 1),
    );
  } else {
    transaction = transaction.setSelection(
      TextSelection.create(transaction.doc, insertPos),
    );
  }

  view.dispatch(transaction.scrollIntoView());
  view.focus();
};
