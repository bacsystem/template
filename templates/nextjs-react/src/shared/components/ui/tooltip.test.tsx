import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

describe('Tooltip', () => {
  // Radix's floating-ui positioning does real (slow) ancestor-style
  // computation under jsdom, regularly taking >5s here even though the
  // assertion is correct — raise this test's timeout so that doesn't
  // register as a false failure.
  const TOOLTIP_TEST_TIMEOUT_MS = 30000;

  it(
    'shows its content on hover',
    async () => {
      render(
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Helpful hint</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      await userEvent.hover(screen.getByText('Hover me'));

      expect(await screen.findByText('Helpful hint')).toBeInTheDocument();
    },
    TOOLTIP_TEST_TIMEOUT_MS
  );
});
