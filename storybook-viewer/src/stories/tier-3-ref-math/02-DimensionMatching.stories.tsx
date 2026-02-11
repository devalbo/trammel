import type { Meta, StoryObj } from '@storybook/react';
import { LiveCanvas } from '../../components/LiveCanvas';

const meta: Meta = {
  title: 'Tier 3 — Reference Math/02 Dimension Matching',
  excludeStories: /Code$/,
};
export default meta;

/**
 * Box B matches Box A's width and takes half its height via reference expressions.
 */
export const defaultCode = `<Sprite viewBox="0 0 250 120">
  <Rect id="a" x={10} y={10} width={100} height={60} fill="#4a90d9" />
  <Rect
    id="b"
    x={10}
    y={80}
    width="#a.width"
    height="#a.height * 0.5"
    fill="#d94a4a"
  />
</Sprite>`;

export const Default: StoryObj = {
  render: () => <LiveCanvas code={defaultCode} />,
};
