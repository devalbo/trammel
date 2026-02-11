import type { Meta, StoryObj } from '@storybook/react';
import { LiveCanvas } from '../../components/LiveCanvas';

const meta: Meta = {
  title: 'Tier 1 — Static Shapes/03 Single Line',
  excludeStories: /Code$/,
};
export default meta;

/** Matches 003-single-line.md exactly */
export const defaultCode = `<Sprite viewBox="0 0 200 120">
  <Line
    id="edge"
    start={{ x: 20, y: 60 }}
    end={{ x: 180, y: 60 }}
    stroke="#333"
    strokeWidth={2}
  />
</Sprite>`;

export const Default: StoryObj = {
  render: () => <LiveCanvas code={defaultCode} />,
};
