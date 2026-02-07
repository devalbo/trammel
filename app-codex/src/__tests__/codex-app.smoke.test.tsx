import React from 'react';
import { render } from '@testing-library/react';
import { CodexApp } from '../CodexApp';

describe('CodexApp', () => {
  it('renders the hello world content', () => {
    const { container } = render(<CodexApp />);
    expect(container.textContent).toContain('Hello from Codex');
  });
});
