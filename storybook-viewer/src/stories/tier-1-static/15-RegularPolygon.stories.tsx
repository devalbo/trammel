import type { Meta, StoryObj } from '@storybook/react';
import { LiveCanvas } from '../../components/LiveCanvas';

const meta: Meta = {
  title: 'Tier 1 — Static Shapes/15 Regular Polygon',
  excludeStories: /Code$/,
};
export default meta;

export const defaultCode = `<Sprite viewBox="0 0 300 200">
  <Polygon
    id="tri"
    sides={3}
    sideLength={50}
    centerX={60}
    centerY={100}
    fill="#e74c3c"
    stroke="#c0392b"
    strokeWidth={1.5}
    rotation={10}
  />
  <Polygon
    id="oct"
    sides={8}
    sideLength={30}
    centerX={160}
    centerY={100}
    fill="#3498db"
    stroke="#2980b9"
    strokeWidth={1.5}
    rotation={-5}
  />
  <Polygon
    id="dodec"
    sides={12}
    sideLength={20}
    centerX={260}
    centerY={100}
    fill="#2ecc71"
    stroke="#27ae60"
    strokeWidth={1.5}
    rotation={15}
  />
</Sprite>`;

export const Default: StoryObj = {
  render: () => <LiveCanvas code={defaultCode} />,
};
