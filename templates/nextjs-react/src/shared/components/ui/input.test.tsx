import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Search } from 'lucide-react';
import { Input } from './input';

describe('Input', () => {
  it('accepts typed input', async () => {
    render(<Input placeholder="Search" />);

    await userEvent.type(screen.getByPlaceholderText('Search'), 'hello');

    expect(screen.getByPlaceholderText('Search')).toHaveValue('hello');
  });

  it('marks itself invalid via aria-invalid', () => {
    render(<Input aria-invalid placeholder="Email" />);

    expect(screen.getByPlaceholderText('Email')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  it('renders a leading icon when passed', () => {
    render(
      <Input icon={<Search data-testid="search-icon" />} placeholder="Search" />
    );

    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });
});
