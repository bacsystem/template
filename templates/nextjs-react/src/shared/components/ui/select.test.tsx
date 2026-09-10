import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { RADIX_PORTAL_TEST_TIMEOUT_MS } from '../../../../tests/radix-portal-test-timeout';

describe('Select', () => {
  it(
    'opens and selects an option',
    async () => {
      const onValueChange = vi.fn();
      render(
        <Select onValueChange={onValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
      );

      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(await screen.findByText('Option B'));

      expect(onValueChange).toHaveBeenCalledWith('b');
    },
    RADIX_PORTAL_TEST_TIMEOUT_MS
  );
});
