import type { Meta, StoryObj } from '@storybook/react';
import { LiveCanvas } from '../../components/LiveCanvas';

const meta: Meta = {
  title: 'Tier 1 — Static Shapes/11 Single Arc',
  excludeStories: /Code$/,
};
export default meta;

export const defaultCode = `<Sprite viewBox="0 0 200 200">
  <Arc
    id="curve"
    center={{ x: 100, y: 100 }}
    r={60}
    startAngle={0}
    endAngle={270}
    stroke="#c0392b"
    strokeWidth={3}
    fill="none"
    rotation={15}
  />
</Sprite>`;

export const Default: StoryObj = {
  render: () => <LiveCanvas code={defaultCode} />,
};
