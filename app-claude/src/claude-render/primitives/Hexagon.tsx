import React from 'react';
import { Polygon } from './Polygon';

export interface HexagonProps {
  id?: string;
  sideLength?: number;
  r?: number;
  centerX?: number;
  centerY?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
}

export const Hexagon: React.FC<HexagonProps> = (props) => (
  <Polygon {...props} sides={6} />
);
