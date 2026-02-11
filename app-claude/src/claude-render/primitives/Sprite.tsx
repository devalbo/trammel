import React, { useEffect } from 'react';
import { SolverProvider, useRenderPhase, useSolver } from './SolverContext';

export interface SpriteProps {
  viewBox: string;
  width?: number | string;
  height?: number | string;
  children: React.ReactNode;
}

/**
 * Renders after all children to log any solver diagnostics to the console.
 */
const DiagnosticsLogger: React.FC = () => {
  const solver = useSolver();
  const phase = useRenderPhase();

  useEffect(() => {
    if (phase !== 'render') return;
    if (!solver) return;
    for (const d of solver.diagnostics) {
      if (d.level === 'error') {
        console.error(`[Sprite] ${d.shapeId}: ${d.message}`);
      } else {
        console.warn(`[Sprite] ${d.shapeId}: ${d.message}`);
      }
    }
  });

  return null;
};

export const Sprite: React.FC<SpriteProps> = ({ viewBox, width, height, children }) => {
  // Default width/height from viewBox dimensions so the SVG has intrinsic size
  const parts = viewBox.split(/\s+/);
  const minX = Number(parts[0]);
  const minY = Number(parts[1]);
  const vbW = Number(parts[2]);
  const vbH = Number(parts[3]);
  const w = width ?? vbW;
  const h = height ?? vbH;

  return (
    <svg viewBox={viewBox} width={w} height={h} xmlns="http://www.w3.org/2000/svg">
      <SolverProvider viewBox={{ minX, minY, width: vbW, height: vbH }}>
        {children}
        <DiagnosticsLogger />
      </SolverProvider>
    </svg>
  );
};
