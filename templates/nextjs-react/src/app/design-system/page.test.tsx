import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DesignSystemPage from './page';

describe('DesignSystemPage', () => {
  it('renders every component section without crashing', () => {
    render(<DesignSystemPage />);

    expect(
      screen.getByRole('heading', { name: 'Design System' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Buttons' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Badges' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Form controls' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dialog' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tabs' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Avatar' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Skeleton' })
    ).toBeInTheDocument();
    expect(screen.getByText('No messages')).toBeInTheDocument();
  });

  it('renders an in-page nav link for every section', () => {
    render(<DesignSystemPage />);

    expect(screen.getByRole('link', { name: 'Buttons' })).toHaveAttribute(
      'href',
      '#buttons'
    );
    expect(screen.getByRole('link', { name: 'Empty state' })).toHaveAttribute(
      'href',
      '#empty-state'
    );
  });
});
