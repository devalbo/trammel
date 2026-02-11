import type { Meta, StoryObj } from '@storybook/react';
import { LiveCanvas } from '../../components/LiveCanvas';

const meta: Meta = {
  title: 'Tier 1 — Static Shapes/01 Single Rect',
  excludeStories: /Code$/,
};
export default meta;

/** Matches 001-single-rect.md exactly */
export const defaultCode = `<Sprite viewBox="0 0 200 120">
  <Rect
    id="plate"
    x={20}
    y={20}
    width={160}
    height={80}
    fill="#b0b0b0"
    stroke="#333"
    strokeWidth={1.5}
    rx={4}
  />
</Sprite>`;

export const noFillCode = `<Sprite viewBox="0 0 200 120">
  <Rect id="outline" x={20} y={20} width={160} height={80} fill="none" stroke="#333" />
</Sprite>`;

export const Default: StoryObj = {
  render: () => <LiveCanvas code={defaultCode} />,
};

/** Outline only — no fill */
export const NoFill: StoryObj = {
  render: () => <LiveCanvas code={noFillCode} />,
};
