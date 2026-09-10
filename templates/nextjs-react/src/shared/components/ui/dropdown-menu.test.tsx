import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

describe('DropdownMenu', () => {
  // jsdom's nwsapi selector engine is pathologically slow matching the
  // long :not() chains Radix's focus-scope/aria-hide use once the portal
  // opens, so a real open+select round trip can take ~20s here even
  // though nothing is hung — raise this test's timeout accordingly.
  it(
    'opens and calls onSelect when an item is chosen',
    async () => {
      const onSelect = vi.fn();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={onSelect}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await userEvent.click(screen.getByText('Open menu'));
      await userEvent.click(await screen.findByText('Log out'));

      expect(onSelect).toHaveBeenCalledTimes(1);
    },
    30000
  );
});
