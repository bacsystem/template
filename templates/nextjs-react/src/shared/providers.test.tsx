import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Providers } from './providers';

describe('Providers', () => {
  it('renders children inside the theme and query providers', () => {
    render(
      <Providers>
        <span>content</span>
      </Providers>
    );

    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
