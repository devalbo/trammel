import React from 'react';
import { Polygon } from './Polygon';

export interface PentagonProps {
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

export const Pentagon: React.FC<PentagonProps> = (props) => (
  <Polygon {...props} sides={5} />
);
