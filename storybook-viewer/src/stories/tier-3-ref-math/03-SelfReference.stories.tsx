import type { Meta, StoryObj } from '@storybook/react';
import { LiveCanvas } from '../../components/LiveCanvas';

const meta: Meta = {
  title: 'Tier 3 — Reference Math/03 Self-Reference',
  excludeStories: /Code$/,
};
export default meta;

/**
 * A rectangle whose height is derived from its own width, locking a 4:3 aspect ratio.
 */
export const defaultCode = `<Sprite viewBox="0 0 200 150">
  <Rect
    id="box"
    x={30}
    y={20}
    width={120}
    height="$self.width * 0.75"
    fill="#4a90d9"
    stroke="#333"
  />
</Sprite>`;

export const Default: StoryObj = {
  render: () => <LiveCanvas code={defaultCode} />,
};
