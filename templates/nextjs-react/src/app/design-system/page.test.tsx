import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DesignSystemPage from './page';

describe('DesignSystemPage', () => {
  it('renders every component section without crashing', () => {
    render(<DesignSystemPage />);

    expect(
      screen.getByRole('heading', { name: 'Design System' })
    ).toBeInTheDocument();
    expect(screen.getByText('Buttons')).toBeInTheDocument();
    expect(screen.getByText('Badges')).toBeInTheDocument();
    expect(screen.getByText('Form controls')).toBeInTheDocument();
    expect(screen.getByText('Dialog')).toBeInTheDocument();
    expect(screen.getByText('Tabs')).toBeInTheDocument();
    expect(screen.getByText('Avatar')).toBeInTheDocument();
    expect(screen.getByText('Skeleton')).toBeInTheDocument();
    expect(screen.getByText('No messages')).toBeInTheDocument();
  });
});
