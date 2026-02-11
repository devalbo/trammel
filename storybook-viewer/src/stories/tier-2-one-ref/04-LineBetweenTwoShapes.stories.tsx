import type { Meta, StoryObj } from '@storybook/react';
import { Sprite, Rect, Line } from '../../index';

const meta: Meta = {
  title: 'Tier 2 — One Reference/04 Line Between Two Shapes',
};
export default meta;

/**
 * Line connects two rects via center anchor references.
 */
export const Default: StoryObj = {
  render: () => (
    <Sprite viewBox="0 0 220 100">
      <Rect id="a" x={20} y={25} width={70} height={50} fill="#4a90d9" />
      <Rect id="b" x={130} y={25} width={70} height={50} fill="#d94a4a" />
      <Line
        id="connector"
        start="#a.center"
        end="#b.center"
        stroke="#333"
        strokeWidth={2}
      />
    </Sprite>
  ),
};
