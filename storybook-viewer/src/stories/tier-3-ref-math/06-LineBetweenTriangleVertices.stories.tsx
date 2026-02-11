import type { Meta, StoryObj } from '@storybook/react';
import { LiveCanvas } from '../../components/LiveCanvas';

const meta: Meta = {
  title: 'Tier 3 — Reference Math/06 Line Between Triangle Vertices',
  excludeStories: /Code$/,
};
export default meta;

/**
 * Line connecting the apex of one triangle to a vertex of another.
 */
export const defaultCode = `<Sprite viewBox="0 0 300 150">
  <Triangle
    id="triA"
    kind="equilateral"
    sideLength={60}
    x={20}
    y={30}
    fill="#4a90d9"
    stroke="#333"
  />

  <Triangle
    id="triB"
    kind="right"
    base={50}
    height={40}
    x={200}
    y={50}
    fill="#2ecc71"
    stroke="#333"
  />

  <Line
    id="link"
    start="#triA.v2"
    end="#triB.v0"
    stroke="#e74c3c"
    strokeWidth={2}
    style={{ strokeDasharray: "6 3" }}
  />
</Sprite>`;

export const Default: StoryObj = {
  render: () => <LiveCanvas code={defaultCode} />,
};
