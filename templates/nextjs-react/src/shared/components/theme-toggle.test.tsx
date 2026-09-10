import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from './theme-toggle';
import { RADIX_PORTAL_TEST_TIMEOUT_MS } from '../../../tests/radix-portal-test-timeout';

describe('ThemeToggle', () => {
  it(
    'lists Light, Dark, and System options and switches to Dark when selected',
    async () => {
      render(
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ThemeToggle />
        </ThemeProvider>
      );

      const trigger = await screen.findByRole('button', {
        name: 'Toggle theme',
      });
      await userEvent.click(trigger);

      expect(
        screen.getByRole('menuitemradio', { name: /Light/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitemradio', { name: /Dark/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitemradio', { name: /System/ })
      ).toBeInTheDocument();

      await userEvent.click(
        screen.getByRole('menuitemradio', { name: /Dark/ })
      );

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    },
    RADIX_PORTAL_TEST_TIMEOUT_MS
  );
});
