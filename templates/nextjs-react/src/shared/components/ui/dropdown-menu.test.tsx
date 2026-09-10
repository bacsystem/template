import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { RADIX_PORTAL_TEST_TIMEOUT_MS } from '../../../../tests/radix-portal-test-timeout';

describe('DropdownMenu', () => {
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
    RADIX_PORTAL_TEST_TIMEOUT_MS
  );
});
