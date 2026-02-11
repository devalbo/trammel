import type { Meta, StoryObj } from '@storybook/react';
import { LiveCanvas } from '../../components/LiveCanvas';

const meta: Meta = {
  title: 'Tier 2 — One Reference/04 Line Between Two Shapes',
  excludeStories: /Code$/,
};
export default meta;

/**
 * Line connects two rects via center anchor references.
 */
export const defaultCode = `<Sprite viewBox="0 0 220 100">
  <Rect id="a" x={20} y={25} width={70} height={50} fill="#4a90d9" />
  <Rect id="b" x={130} y={25} width={70} height={50} fill="#d94a4a" />
  <Line
    id="connector"
    start="#a.center"
    end="#b.center"
    stroke="#333"
    strokeWidth={2}
  />
</Sprite>`;

export const Default: StoryObj = {
  render: () => <LiveCanvas code={defaultCode} />,
};
