import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders its text and applies the default variant class', () => {
    render(<Badge>New</Badge>);

    expect(screen.getByText('New')).toHaveClass('bg-primary');
  });

  it('applies the destructive variant class when requested', () => {
    render(<Badge variant="destructive">Error</Badge>);

    expect(screen.getByText('Error')).toHaveClass('bg-destructive');
  });
});
