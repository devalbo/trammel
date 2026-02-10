import type { Meta, StoryObj } from '@storybook/react';
import { Sprite, Triangle } from '../../index';

const meta: Meta = {
  title: 'Tier 1 — Static Shapes/07 Equilateral Triangle',
};
export default meta;

/** Matches 042-equilateral-triangle.md exactly */
export const Default: StoryObj = {
  render: () => (
    <Sprite viewBox="0 0 200 200">
      <Triangle
        id="tri"
        kind="equilateral"
        sideLength={80}
        x={60}
        y={30}
        fill="#4a90d9"
        stroke="#2a5080"
        strokeWidth={1.5}
      />
    </Sprite>
  ),
};
