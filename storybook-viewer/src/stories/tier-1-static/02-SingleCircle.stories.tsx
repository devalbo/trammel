import type { Meta, StoryObj } from '@storybook/react';
import { Sprite, Circle } from '../../index';

const meta: Meta = {
  title: 'Tier 1 — Static Shapes/02 Single Circle',
};
export default meta;

/** Matches 002-single-circle.md exactly */
export const Default: StoryObj = {
  render: () => (
    <Sprite viewBox="0 0 200 200">
      <Circle
        id="hub"
        centerX={100}
        centerY={100}
        r={40}
        fill="#4a90d9"
        stroke="#2a5080"
        strokeWidth={2}
      />
    </Sprite>
  ),
};
