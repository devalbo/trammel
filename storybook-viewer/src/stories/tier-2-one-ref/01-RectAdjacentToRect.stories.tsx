import type { Meta, StoryObj } from '@storybook/react';
import { Sprite, Rect } from '../../index';

const meta: Meta = {
  title: 'Tier 2 — One Reference/01 Rect Adjacent to Rect',
};
export default meta;

/**
 * Box B's left edge snaps to Box A's right edge via reference string.
 * Box B's top aligns to Box A's top.
 */
export const Default: StoryObj = {
  render: () => (
    <Sprite viewBox="0 0 200 100">
      <Rect
        id="boxA"
        x={10}
        y={20}
        width={70}
        height={50}
        fill="#4a90d9"
      />
      <Rect
        id="boxB"
        left="#boxA.right"
        top="#boxA.top"
        width={70}
        height={50}
        fill="#d94a4a"
      />
    </Sprite>
  ),
};
