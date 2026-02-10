import type { Meta, StoryObj } from '@storybook/react';
import { Sprite, Triangle } from '../../index';

const meta: Meta = {
  title: 'Tier 1 — Static Shapes/13 Scalene Triangle',
};
export default meta;

export const Default: StoryObj = {
  render: () => (
    <Sprite viewBox="0 0 300 200">
      <Triangle
        id="acute"
        kind="scalene"
        a={50}
        b={60}
        c={70}
        x={20}
        y={30}
        fill="#4a90d9"
        stroke="#333"
        strokeWidth={1}
        rotation={8}
      />
      <Triangle
        id="obtuse"
        kind="scalene"
        a={30}
        b={40}
        c={60}
        x={160}
        y={50}
        fill="#e74c3c"
        stroke="#333"
        strokeWidth={1}
        rotation={-5}
      />
    </Sprite>
  ),
};
