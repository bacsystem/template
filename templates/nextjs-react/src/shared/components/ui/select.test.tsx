import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

describe('Select', () => {
  // Radix's popper-based positioning (SelectContent's default `position="popper"`)
  // settles synchronously and correctly, but takes tens of seconds under jsdom's
  // layout stubs — well past vitest's 5s default. Bump this test's timeout rather
  // than the whole suite's.
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
    60000
  );
});
