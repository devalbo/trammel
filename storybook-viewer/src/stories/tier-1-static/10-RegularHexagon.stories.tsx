import type { Meta, StoryObj } from '@storybook/react';
import { LiveCanvas } from '../../components/LiveCanvas';

const meta: Meta = {
  title: 'Tier 1 — Static Shapes/10 Regular Hexagon',
  excludeStories: /Code$/,
};
export default meta;

export const defaultCode = `<Sprite viewBox="0 0 200 200">
  <Hexagon
    id="hex"
    sideLength={40}
    centerX={100}
    centerY={100}
    fill="#1abc9c"
    stroke="#16a085"
    strokeWidth={1.5}
    rotation={15}
  />
</Sprite>`;

export const Default: StoryObj = {
  render: () => <LiveCanvas code={defaultCode} />,
};
