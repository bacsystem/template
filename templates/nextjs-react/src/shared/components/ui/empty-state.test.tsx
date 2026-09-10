import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Inbox } from 'lucide-react';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('renders the title, description, and calls the action when clicked', async () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        icon={<Inbox data-testid="icon" />}
        title="No messages"
        description="You're all caught up."
        action={{ label: 'Refresh', onClick }}
      />
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('No messages')).toBeInTheDocument();
    expect(screen.getByText("You're all caught up.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
