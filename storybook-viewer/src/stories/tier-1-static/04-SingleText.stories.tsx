import type { Meta, StoryObj } from '@storybook/react';
import { Sprite, SpriteText as Text } from '../../index';

const meta: Meta = {
  title: 'Tier 1 — Static Shapes/04 Single Text',
};
export default meta;

/** Matches 004-single-text.md exactly */
export const Default: StoryObj = {
  render: () => (
    <Sprite viewBox="0 0 200 80">
      <Text
        id="label"
        x={100}
        y={45}
        fontSize={18}
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fill="#333"
        textAnchor="middle"
      >
        PLATE A
      </Text>
    </Sprite>
  ),
};
