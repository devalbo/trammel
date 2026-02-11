import type { Meta, StoryObj } from '@storybook/react';
import { Sprite, Rect } from '../../index';

const meta: Meta = {
  title: 'Tier 2 — One Reference/03 Collinear Edges',
};
export default meta;

/**
 * Bottom rect's left edge aligns to top rect's left edge via reference string.
 */
export const Default: StoryObj = {
  render: () => (
    <Sprite viewBox="0 0 200 160">
      <Rect id="top" x={40} y={10} width={100} height={50} fill="#4a90d9" />
      <Rect id="bottom" left="#top.left" y={80} width={60} height={50} fill="#2ecc71" />
    </Sprite>
  ),
};
