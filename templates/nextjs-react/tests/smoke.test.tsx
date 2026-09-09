import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('test environment', () => {
  it('renders with jsdom and testing-library matchers', () => {
    render(<div>ready</div>);
    expect(screen.getByText('ready')).toBeInTheDocument();
  });
});
