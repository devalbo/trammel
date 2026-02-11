import type { Meta, StoryObj } from '@storybook/react';
import { LiveCanvas } from '../../components/LiveCanvas';

const meta: Meta = {
  title: 'Tier 1 — Static Shapes/06 Single Point (Construction Geometry)',
  excludeStories: /Code$/,
};
export default meta;

/**
 * Point renders nothing. The circle uses explicit values here;
 * reference strings (#pivot.x) require the solver context (Tier 2+).
 */
export const defaultCode = `<Sprite viewBox="0 0 200 200">
  <Point id="pivot" at={{ x: 100, y: 100 }} />
  <Circle
    id="ring"
    centerX={100}
    centerY={100}
    r={30}
    fill="none"
    stroke="#333"
    strokeWidth={2}
  />
</Sprite>`;

export const Default: StoryObj = {
  render: () => <LiveCanvas code={defaultCode} />,
};
