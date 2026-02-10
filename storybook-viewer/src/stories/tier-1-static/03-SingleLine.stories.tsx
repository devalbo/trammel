import type { Meta, StoryObj } from '@storybook/react';
import { Sprite, Line } from '../../index';

const meta: Meta = {
  title: 'Tier 1 — Static Shapes/03 Single Line',
};
export default meta;

/** Matches 003-single-line.md exactly */
export const Default: StoryObj = {
  render: () => (
    <Sprite viewBox="0 0 200 120">
      <Line
        id="edge"
        start={{ x: 20, y: 60 }}
        end={{ x: 180, y: 60 }}
        stroke="#333"
        strokeWidth={2}
      />
    </Sprite>
  ),
};
