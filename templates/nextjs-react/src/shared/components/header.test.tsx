import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Header } from './header';

describe('Header', () => {
  it('renders the title when passed', () => {
    render(<Header title="Dashboard" />);

    expect(
      screen.getByRole('heading', { name: 'Dashboard' })
    ).toBeInTheDocument();
  });

  it('renders the actions slot when passed', () => {
    render(<Header actions={<button>Log out</button>} />);

    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });

  it('renders without crashing when no props are given', () => {
    render(<Header />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
