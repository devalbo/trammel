import type { Meta, StoryObj } from '@storybook/react';
import { Sprite, Triangle } from '../../index';

const meta: Meta = {
  title: 'Tier 1 — Static Shapes/08 Right Triangle',
};
export default meta;

export const Default: StoryObj = {
  render: () => (
    <Sprite viewBox="0 0 200 150">
      <Triangle
        id="rt"
        kind="right"
        base={80}
        height={60}
        x={30}
        y={20}
        fill="#2ecc71"
        stroke="#1a8a4a"
        strokeWidth={1.5}
        rotation={10}
      />
    </Sprite>
  ),
};
