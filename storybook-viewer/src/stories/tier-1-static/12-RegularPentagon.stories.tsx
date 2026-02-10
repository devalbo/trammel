import type { Meta, StoryObj } from '@storybook/react';
import { Sprite, Pentagon } from '../../index';

const meta: Meta = {
  title: 'Tier 1 — Static Shapes/12 Regular Pentagon',
};
export default meta;

export const Default: StoryObj = {
  render: () => (
    <Sprite viewBox="0 0 200 200">
      <Pentagon
        id="pent"
        r={60}
        centerX={100}
        centerY={100}
        fill="#9b59b6"
        stroke="#6c3483"
        strokeWidth={1.5}
        rotation={10}
      />
    </Sprite>
  ),
};
