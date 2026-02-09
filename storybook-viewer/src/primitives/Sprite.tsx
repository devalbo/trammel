import React from 'react';

export interface SpriteProps {
  viewBox: string;
  width?: number | string;
  height?: number | string;
  children: React.ReactNode;
}

export const Sprite: React.FC<SpriteProps> = ({ viewBox, width, height, children }) => {
  // Default width/height from viewBox dimensions so the SVG has intrinsic size
  const [, , vbW, vbH] = viewBox.split(/\s+/);
  const w = width ?? Number(vbW);
  const h = height ?? Number(vbH);

  return (
    <svg viewBox={viewBox} width={w} height={h} xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
};
