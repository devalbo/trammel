import type { Meta, StoryObj } from '@storybook/react';
import { LiveCanvas } from '../../components/LiveCanvas';

const meta: Meta = {
  title: 'Tier 1 — Static Shapes/08 Right Triangle',
  excludeStories: /Code$/,
};
export default meta;

export const defaultCode = `<Sprite viewBox="0 0 200 150">
  <Triangle
    id="rt"
    kind="right"
    base={80}
    height={60}
    x={30}
    y={20}
    fill="#2ecc71"
    stroke="#1a8a4a"
    strokeWidth={1.5}
    rotation={10}
  />
</Sprite>`;

export const Default: StoryObj = {
  render: () => <LiveCanvas code={defaultCode} />,
};
