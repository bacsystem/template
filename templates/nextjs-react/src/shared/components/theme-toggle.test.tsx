import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  it('toggles the theme when clicked', async () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = await screen.findByRole('button', { name: 'Toggle theme' });
    expect(button).not.toBeDisabled();

    await userEvent.click(button);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
