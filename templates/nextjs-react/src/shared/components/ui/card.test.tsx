import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

describe('Card', () => {
  it('renders its title, description, and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Storage</CardTitle>
          <CardDescription>Usage this month</CardDescription>
        </CardHeader>
        <CardContent>4.2 GB used</CardContent>
      </Card>
    );

    expect(screen.getByRole('heading', { name: 'Storage' })).toBeInTheDocument();
    expect(screen.getByText('Usage this month')).toBeInTheDocument();
    expect(screen.getByText('4.2 GB used')).toBeInTheDocument();
  });
});
