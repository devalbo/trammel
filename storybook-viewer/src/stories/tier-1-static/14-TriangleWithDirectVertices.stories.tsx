import type { Meta, StoryObj } from '@storybook/react';
import { Sprite, Triangle } from '../../index';

const meta: Meta = {
  title: 'Tier 1 — Static Shapes/14 Triangle with Direct Vertices',
};
export default meta;

export const Default: StoryObj = {
  render: () => (
    <Sprite viewBox="0 0 200 200">
      <Triangle
        id="custom"
        vertices={[
          { x: 30, y: 160 },
          { x: 170, y: 140 },
          { x: 80, y: 30 },
        ]}
        fill="#9b59b6"
        stroke="#6c3483"
        strokeWidth={1.5}
        rotation={12}
      />
    </Sprite>
  ),
};
