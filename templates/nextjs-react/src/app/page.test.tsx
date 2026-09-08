import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from './page';
import { Providers } from '@/shared/providers';

describe('HomePage', () => {
  it('renders the project name and a call-to-action button', () => {
    render(
      <Providers>
        <HomePage />
      </Providers>
    );

    expect(screen.getByRole('button', { name: 'Get started' })).toBeInTheDocument();
  });
});
