export interface DrawnixPoint {
  x: number;
  y: number;
}

export interface DrawnixStroke {
  color: string;
  size: number;
  points: DrawnixPoint[];
}

export interface DrawnixBlockData {
  width: number;
  height: number;
  background: string;
  strokes: DrawnixStroke[];
}

export const createEmptyDrawnixData = (): DrawnixBlockData => ({
  width: 960,
  height: 540,
  background: '#ffffff',
  strokes: [],
});
