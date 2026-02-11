import type { Meta, StoryObj } from '@storybook/react';
import { LiveCanvas } from '../../components/LiveCanvas';

const meta: Meta = {
  title: 'Tier 3 — Reference Math/01 Reference String with Offset',
  excludeStories: /Code$/,
};
export default meta;

/**
 * Box B is positioned 10px to the right of Box A using arithmetic in the reference string.
 * Also validates dimension reference (height="#a.height").
 */
export const defaultCode = `<Sprite viewBox="0 0 220 100">
  <Rect id="a" x={10} y={20} width={70} height={50} fill="#4a90d9" />
  <Rect
    id="b"
    left="#a.right + 10"
    top="#a.top"
    width={70}
    height="#a.height"
    fill="#d94a4a"
  />
</Sprite>`;

export const Default: StoryObj = {
  render: () => <LiveCanvas code={defaultCode} />,
};
