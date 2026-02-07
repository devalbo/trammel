import React from 'react';
import type { Point } from '../types';

type Props = {
  cols: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  gap: number;
  children: (pos: Point, col: number, row: number) => React.ReactNode;
};

export function Grid({ cols, rows, cellWidth, cellHeight, gap, children }: Props) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => {
          const pos: Point = {
            x: col * (cellWidth + gap),
            y: row * (cellHeight + gap),
          };
          return (
            <React.Fragment key={`${col}-${row}`}>
              {children(pos, col, row)}
            </React.Fragment>
          );
        })
      )}
    </>
  );
}
