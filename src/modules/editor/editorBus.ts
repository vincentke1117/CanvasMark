import mitt from 'mitt';

export type EditorCommandPayloads = {
  'insert:drawnix-block': {
    blockId: string;
  };
};

export const editorBus = mitt<EditorCommandPayloads>();
