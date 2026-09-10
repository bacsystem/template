import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar, AvatarFallback } from './avatar';

describe('Avatar', () => {
  it('renders the fallback initials', () => {
    render(
      <Avatar>
        <AvatarFallback>AD</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByText('AD')).toBeInTheDocument();
  });
});
