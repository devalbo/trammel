import type { Meta, StoryObj } from '@storybook/react';
import { LiveCanvas } from '../../components/LiveCanvas';

const meta: Meta = {
  title: 'Tier 3 — Reference Math/04 Vertex Reference (Triangle)',
  excludeStories: /Code$/,
};
export default meta;

/**
 * Circles placed at each vertex of a triangle using vertex anchor references.
 * Tests that #tri.v0, #tri.v1, #tri.v2 resolve to Point2D values and that
 * .x/.y sub-anchors resolve to scalars.
 */
export const defaultCode = `<Sprite viewBox="0 0 200 200">
  <Triangle
    id="tri"
    kind="equilateral"
    sideLength={100}
    x={50}
    y={25}
    fill="#e8e8e8"
    stroke="#999"
  />

  <Circle id="dot0" centerX="#tri.v0.x" centerY="#tri.v0.y" r={6} fill="#e74c3c" />
  <Circle id="dot1" centerX="#tri.v1.x" centerY="#tri.v1.y" r={6} fill="#3498db" />
  <Circle id="dot2" centerX="#tri.v2.x" centerY="#tri.v2.y" r={6} fill="#2ecc71" />
</Sprite>`;

export const Default: StoryObj = {
  render: () => <LiveCanvas code={defaultCode} />,
};
