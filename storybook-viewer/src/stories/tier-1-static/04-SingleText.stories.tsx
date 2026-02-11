import type { Meta, StoryObj } from '@storybook/react';
import { LiveCanvas } from '../../components/LiveCanvas';

const meta: Meta = {
  title: 'Tier 1 — Static Shapes/04 Single Text',
  excludeStories: /Code$/,
};
export default meta;

/** Matches 004-single-text.md exactly */
export const defaultCode = `<Sprite viewBox="0 0 200 80">
  <SpriteText
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
  </SpriteText>
</Sprite>`;

export const Default: StoryObj = {
  render: () => <LiveCanvas code={defaultCode} />,
};
