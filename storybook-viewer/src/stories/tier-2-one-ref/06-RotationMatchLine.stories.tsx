import type { Meta, StoryObj } from '@storybook/react';
import { LiveCanvas } from '../../components/LiveCanvas';

const meta: Meta = {
  title: 'Tier 2 — One Reference/06 Rotation Match (Line)',
  excludeStories: /Code$/,
};
export default meta;

/**
 * Line rotation matches a triangle's rotation via rotation="#tri.rotation".
 */
export const defaultCode = `<Sprite viewBox="0 0 240 160">
  <Triangle id="tri" kind="equilateral" sideLength={80} x={20} y={20} rotation={-20} fill="#e8e8e8" stroke="#777" />
  <Line id="ln" start={{ x: 140, y: 40 }} end={{ x: 200, y: 40 }} rotation="#tri.rotation" stroke="#d94a4a" strokeWidth={3} />
</Sprite>`;

export const Default: StoryObj = {
  render: () => <LiveCanvas code={defaultCode} />,
};
