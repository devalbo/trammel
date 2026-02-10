import type { Meta, StoryObj } from '@storybook/react';
import { Sprite, Triangle } from '../../index';

const meta: Meta = {
  title: 'Tier 1 — Static Shapes/09 Isosceles Triangle',
};
export default meta;

export const Default: StoryObj = {
  render: () => (
    <Sprite viewBox="0 0 300 200">
      <Triangle
        id="tall"
        kind="isosceles"
        base={40}
        height={80}
        x={40}
        y={20}
        fill="#4a90d9"
        stroke="#333"
        rotation={12}
      />
      <Triangle
        id="wide"
        kind="isosceles"
        base={100}
        height={30}
        x={150}
        y={70}
        fill="#e74c3c"
        stroke="#333"
        rotation={-8}
      />
      <Triangle
        id="legs_form"
        kind="isosceles"
        base={60}
        legs={50}
        x={40}
        y={120}
        fill="#f39c12"
        stroke="#333"
        rotation={5}
      />
    </Sprite>
  ),
};
