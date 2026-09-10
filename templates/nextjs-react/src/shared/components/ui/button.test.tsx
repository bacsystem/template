import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders children and applies the default variant class', () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveClass('bg-primary');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies square dimensions for the icon size', () => {
    render(<Button size="icon" aria-label="Icon action" />);

    const button = screen.getByRole('button', { name: 'Icon action' });
    expect(button).toHaveClass('h-10');
    expect(button).toHaveClass('w-10');
  });
});
