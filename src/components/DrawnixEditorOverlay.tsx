import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type PointerEvent as ReactPointerEvent,
  type ChangeEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { editorBus } from '../modules/editor/editorBus';
import { useDocumentStore } from '../modules/documents/documentStore';
import { cloneDrawnixData } from '../modules/blocks/drawnixPlaceholders';
import {
  DrawnixBlockData,
  DrawnixStroke,
  createEmptyDrawnixData,
} from '../modules/blocks/drawnixTypes';

const BRUSH_COLORS = ['#1f1f24', '#4c6ef5', '#ff6b6b', '#37b24d', '#fab005'];
const BRUSH_SIZES = [3, 5, 8, 12];

const useEventBus = (event: 'drawnix:open-editor', handler: (payload: { blockId: string }) => void) => {
  useEffect(() => {
    editorBus.on(event, handler);
    return () => {
      editorBus.off(event, handler);
    };
  }, [event, handler]);
};

const useKeyClose = (onClose: () => void, isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) return;
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [isOpen, onClose]);
};

const drawStroke = (context: CanvasRenderingContext2D, stroke: DrawnixStroke) => {
  if (stroke.points.length === 0) return;
  context.strokeStyle = stroke.color;
  context.lineWidth = stroke.size;
  context.lineJoin = 'round';
  context.lineCap = 'round';
  context.beginPath();
  const [first, ...rest] = stroke.points;
  context.moveTo(first.x, first.y);
  if (rest.length === 0) {
    context.lineTo(first.x + 0.01, first.y + 0.01);
  } else {
    rest.forEach((point) => context.lineTo(point.x, point.y));
  }
  context.stroke();
};

const renderCanvas = (
  canvas: HTMLCanvasElement,
  data: DrawnixBlockData,
  liveStroke: DrawnixStroke | null = null,
) => {
  const ratio = window.devicePixelRatio || 1;
  const context = canvas.getContext('2d');
  if (!context) return;

  canvas.width = data.width * ratio;
  canvas.height = data.height * ratio;
  canvas.style.width = `${data.width}px`;
  canvas.style.height = `${data.height}px`;

  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, data.width, data.height);
  context.fillStyle = data.background;
  context.fillRect(0, 0, data.width, data.height);

  data.strokes.forEach((stroke) => drawStroke(context, stroke));
  if (liveStroke) {
    drawStroke(context, liveStroke);
  }
};

const getCanvasPoint = (canvas: HTMLCanvasElement, event: PointerEvent) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

export const DrawnixEditorOverlay = () => {
  const updateBlock = useDocumentStore((state) => state.updateBlock);
  const [blockId, setBlockId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [brushColor, setBrushColor] = useState(BRUSH_COLORS[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [data, setData] = useState<DrawnixBlockData>(createEmptyDrawnixData());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const liveStrokeRef = useRef<DrawnixStroke | null>(null);
  const drawingRef = useRef(false);

  const closeOverlay = useCallback(() => {
    setBlockId(null);
    setDescription('');
    setData(createEmptyDrawnixData());
    liveStrokeRef.current = null;
    drawingRef.current = false;
  }, []);

  useKeyClose(closeOverlay, blockId !== null);

  const openEditor = useCallback((payload: { blockId: string }) => {
    const snapshot = useDocumentStore.getState().document.blocks[payload.blockId];
    if (!snapshot) return;
    setBlockId(payload.blockId);
    const cloned = cloneDrawnixData(snapshot.data);
    setData(cloned);
    setDescription(snapshot.description ?? '');
    requestAnimationFrame(() => {
      if (canvasRef.current) {
        renderCanvas(canvasRef.current, cloned);
      }
    });
  }, []);

  useEventBus('drawnix:open-editor', openEditor);

  useEffect(() => {
    if (!blockId || !canvasRef.current) return;
    renderCanvas(canvasRef.current, data, liveStrokeRef.current);
  }, [blockId, data]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    canvasRef.current.setPointerCapture(event.pointerId);
    const point = getCanvasPoint(canvasRef.current, event.nativeEvent);
    const stroke: DrawnixStroke = {
      color: brushColor,
      size: brushSize,
      points: [point],
    };
    liveStrokeRef.current = stroke;
    drawingRef.current = true;
    renderCanvas(canvasRef.current, data, stroke);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !drawingRef.current || !liveStrokeRef.current) return;
    const point = getCanvasPoint(canvasRef.current, event.nativeEvent);
    liveStrokeRef.current.points.push(point);
    renderCanvas(canvasRef.current, data, liveStrokeRef.current);
  };

  const finalizeStroke = () => {
    if (!canvasRef.current || !drawingRef.current || !liveStrokeRef.current) return;
    const nextData: DrawnixBlockData = {
      ...data,
      strokes: [...data.strokes, { ...liveStrokeRef.current }],
    };
    setData(nextData);
    liveStrokeRef.current = null;
    drawingRef.current = false;
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    finalizeStroke();
    canvasRef.current.releasePointerCapture(event.pointerId);
  };

  const handlePointerLeave = () => {
    finalizeStroke();
  };

  const handleUndo = () => {
    if (data.strokes.length === 0 || !canvasRef.current) return;
    const nextData: DrawnixBlockData = {
      ...data,
      strokes: data.strokes.slice(0, -1),
    };
    setData(nextData);
  };

  const handleClear = () => {
    if (!canvasRef.current) return;
    const nextData: DrawnixBlockData = {
      ...data,
      strokes: [],
    };
    setData(nextData);
  };

  const handleBackgroundChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextData: DrawnixBlockData = {
      ...data,
      background: event.target.value,
    };
    setData(nextData);
  };

  const handleSave = async () => {
    if (!blockId || !canvasRef.current) return;
    renderCanvas(canvasRef.current, data);
    const preview = canvasRef.current.toDataURL('image/png');
    const desc = description.trim();
    updateBlock(blockId, (snapshot) => ({
      ...snapshot,
      data: { ...data, strokes: data.strokes.map((stroke) => ({
        color: stroke.color,
        size: stroke.size,
        points: stroke.points.map((point) => ({ ...point })),
      })) },
      preview,
      size: {
        ...snapshot.size,
        width: data.width,
        height: data.height,
      },
      description: desc || snapshot.description,
      meta: {
        ...snapshot.meta,
        updatedAt: new Date().toISOString(),
      },
    }));
    closeOverlay();
  };

  const handleResize = (event: ChangeEvent<HTMLInputElement>, dimension: 'width' | 'height') => {
    const value = Number.parseInt(event.target.value, 10);
    if (Number.isNaN(value) || value < 200 || value > 1920) return;
    const nextData: DrawnixBlockData = {
      ...data,
      [dimension]: value,
    };
    setData(nextData);
  };

  if (!blockId) return null;

  return createPortal(
    <div className="cm-drawnix-overlay" role="dialog" aria-modal="true" aria-labelledby="drawnix-editor-title">
      <div className="cm-drawnix-overlay__content">
        <header className="cm-drawnix-overlay__header">
          <h2 id="drawnix-editor-title">编辑 Drawnix 白板块</h2>
          <button type="button" className="cm-button" onClick={closeOverlay}>
            取消
          </button>
        </header>
        <div className="cm-drawnix-overlay__body">
          <div className="cm-drawnix-overlay__canvas">
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerLeave}
            />
          </div>
          <aside className="cm-drawnix-overlay__controls">
            <section>
              <h3>画笔颜色</h3>
              <div className="cm-drawnix-overlay__swatches">
                {BRUSH_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`cm-swatch ${brushColor === color ? 'cm-swatch--active' : ''}`}
                    style={{ background: color }}
                    onClick={() => setBrushColor(color)}
                    aria-label={`选择画笔颜色 ${color}`}
                  />
                ))}
              </div>
            </section>
            <section>
              <h3>画笔粗细</h3>
              <div className="cm-drawnix-overlay__swatches">
                {BRUSH_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`cm-swatch cm-swatch--size ${brushSize === size ? 'cm-swatch--active' : ''}`}
                    onClick={() => setBrushSize(size)}
                    aria-label={`选择画笔粗细 ${size}px`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </section>
            <section>
              <h3>画布背景</h3>
              <input type="color" value={data.background} onChange={handleBackgroundChange} aria-label="画布背景色" />
            </section>
            <section>
              <h3>画布尺寸</h3>
              <label className="cm-field">
                <span>宽度</span>
                <input
                  type="number"
                  min={200}
                  max={1920}
                  value={data.width}
                  onChange={(event) => handleResize(event, 'width')}
                />
              </label>
              <label className="cm-field">
                <span>高度</span>
                <input
                  type="number"
                  min={200}
                  max={1080}
                  value={data.height}
                  onChange={(event) => handleResize(event, 'height')}
                />
              </label>
            </section>
            <section>
              <h3>说明文字</h3>
              <textarea
                className="cm-textarea"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="为白板块写一句说明，导出时会作为图片说明文本。"
                rows={3}
              />
            </section>
            <section className="cm-drawnix-overlay__actions">
              <button type="button" className="cm-button" onClick={handleUndo} disabled={data.strokes.length === 0}>
                撤销一步
              </button>
              <button type="button" className="cm-button" onClick={handleClear} disabled={data.strokes.length === 0}>
                清空画布
              </button>
            </section>
          </aside>
        </div>
        <footer className="cm-drawnix-overlay__footer">
          <button type="button" className="cm-button" onClick={closeOverlay}>
            取消
          </button>
          <button type="button" className="cm-button cm-button--primary" onClick={handleSave}>
            保存白板
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
};
