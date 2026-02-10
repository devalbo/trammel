import type { Meta, StoryObj } from '@storybook/react';
import { Sprite, Path } from '../../index';

const meta: Meta = {
  title: 'Tier 1 — Static Shapes/05 Single Path',
};
export default meta;

/** Matches 005-single-path.md exactly */
export const Default: StoryObj = {
  render: () => (
    <Sprite viewBox="0 0 200 200">
      <Path
        id="arrow"
        normalized={false}
        d="M 40 100 L 140 100 L 140 70 L 180 110 L 140 150 L 140 120 L 40 120 Z"
        fill="#4a90d9"
        stroke="#2a5080"
        strokeWidth={1.5}
      />
    </Sprite>
  ),
};
