import type { Meta, StoryObj } from '@storybook/react';
import { LiveCanvas } from '../../components/LiveCanvas';

const meta: Meta = {
  title: 'Tier 2 — One Reference/03 Collinear Edges',
  excludeStories: /Code$/,
};
export default meta;

/**
 * Bottom rect's left edge aligns to top rect's left edge via reference string.
 */
export const defaultCode = `<Sprite viewBox="0 0 200 160">
  <Rect id="top" x={90} y={10} width={100} height={50} fill="#4a90d9" />
  <Rect id="bottom" right="#top.left" top="#top.bottom" width={60} height={50} fill="#2ecc71" />
</Sprite>`;

export const Default: StoryObj = {
  render: () => <LiveCanvas code={defaultCode} />,
};
