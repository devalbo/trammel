import type { Meta, StoryObj } from '@storybook/react';
import { Sprite, Rect, Circle } from '../../index';

const meta: Meta = {
  title: 'Tier 2 — One Reference/02 Circle Centered on Rect',
};
export default meta;

/**
 * Circle centered on rect via reference strings.
 */
export const Default: StoryObj = {
  render: () => (
    <Sprite viewBox="0 0 200 100">
      <Rect
        id="box"
        x={30}
        y={20}
        width={80}
        height={50}
        fill="#e8e8e8"
        stroke="#999"
      />
      <Circle
        id="dot"
        centerX="#box.centerX"
        centerY="#box.centerY"
        r={12}
        fill="#c0392b"
      />
    </Sprite>
  ),
};
