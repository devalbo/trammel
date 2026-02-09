import type { Preview } from '@storybook/react';
import React from 'react';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a2e' },
        { name: 'grid', value: '#f5f5f5' },
      ],
    },
    layout: 'centered',
  },
  decorators: [
    (Story) =>
      React.createElement(
        'div',
        { style: { padding: 20, border: '1px solid #eee', background: 'white' } },
        React.createElement(Story),
      ),
  ],
};

export default preview;
