import type { Meta, StoryObj } from '@storybook/react';
import { LiveCanvas } from '../../components/LiveCanvas';

const meta: Meta = {
  title: 'Tier 3 — Reference Math/05 Vertex Reference (Polygon)',
  excludeStories: /Code$/,
};
export default meta;

/**
 * Lines connecting each vertex of a hexagon to its center.
 * Tests #hex.v0..#hex.v5 and #hex.center.
 */
export const defaultCode = `<Sprite viewBox="0 0 200 200">
  <Polygon
    id="hex"
    sides={6}
    r={60}
    centerX={100}
    centerY={100}
    fill="#e8f4f8"
    stroke="#2c3e50"
    strokeWidth={1.5}
  />

  <Line start="#hex.v0" end="#hex.center" stroke="#95a5a6" strokeWidth={0.5} />
  <Line start="#hex.v1" end="#hex.center" stroke="#95a5a6" strokeWidth={0.5} />
  <Line start="#hex.v2" end="#hex.center" stroke="#95a5a6" strokeWidth={0.5} />
  <Line start="#hex.v3" end="#hex.center" stroke="#95a5a6" strokeWidth={0.5} />
  <Line start="#hex.v4" end="#hex.center" stroke="#95a5a6" strokeWidth={0.5} />
  <Line start="#hex.v5" end="#hex.center" stroke="#95a5a6" strokeWidth={0.5} />
</Sprite>`;

export const Default: StoryObj = {
  render: () => <LiveCanvas code={defaultCode} />,
};
