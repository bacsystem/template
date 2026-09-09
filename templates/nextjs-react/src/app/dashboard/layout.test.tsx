import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DashboardLayout from './layout';

describe('DashboardLayout', () => {
  it('renders the Header with the Dashboard title and the page content', () => {
    render(
      <DashboardLayout>
        <p>page content</p>
      </DashboardLayout>
    );

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('page content')).toBeInTheDocument();
  });
});
