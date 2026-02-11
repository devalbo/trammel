import type { Meta, StoryObj } from '@storybook/react';
import { LiveCanvas } from '../../components/LiveCanvas';

const meta: Meta = {
  title: 'Tier 2 — One Reference/05 Rotation Match (Rect)',
  excludeStories: /Code$/,
};
export default meta;

/**
 * Rect B matches Rect A's rotation via rotation="#a.rotation".
 */
export const defaultCode = `<Sprite viewBox="0 0 220 140">
  <Rect id="a" x={30} y={20} width={80} height={40} rotation={25} fill="#4a90d9" />
  <Rect id="b" x={120} y={60} width={80} height={40} rotation="#a.rotation" fill="#d94a4a" />
</Sprite>`;

export const Default: StoryObj = {
  render: () => <LiveCanvas code={defaultCode} />,
};
