import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Switch } from './switch';

describe('Switch', () => {
  it('toggles on and off when clicked', async () => {
    render(<Switch aria-label="Enable notifications" />);

    const toggle = screen.getByRole('switch', { name: 'Enable notifications' });
    expect(toggle).not.toBeChecked();

    await userEvent.click(toggle);

    expect(toggle).toBeChecked();
  });
});
