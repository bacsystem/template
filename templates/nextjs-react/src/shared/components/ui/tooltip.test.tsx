import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';
import { RADIX_PORTAL_TEST_TIMEOUT_MS } from '../../../../tests/radix-portal-test-timeout';

describe('Tooltip', () => {
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
    RADIX_PORTAL_TEST_TIMEOUT_MS
  );
});
