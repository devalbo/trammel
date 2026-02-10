import React from 'react';

export interface Point2DValue {
  x: number;
  y: number;
}

export interface PointProps {
  id?: string;
  at?: Point2DValue;
}

/**
 * Invisible construction geometry. Renders nothing to SVG.
 * Registers coordinates in the solver context so other shapes can reference it.
 */
export const Point: React.FC<PointProps> = () => null;
