import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '@/components/EmptyState';

describe('EmptyState', () => {
  it('renders as a status region, never an alert — nothing is wrong', () => {
    render(<EmptyState title="No skills available" />);

    expect(screen.getByRole('status')).toHaveTextContent('No skills available');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders an optional description without requiring one', () => {
    render(<EmptyState title="No skill matches this search" description="Try a shorter name." />);

    expect(screen.getByText('Try a shorter name.')).toBeInTheDocument();
  });

  it('renders the clear-filters action only when given one, and fires it', async () => {
    const onClick = vi.fn();
    const { rerender } = render(<EmptyState title="No skills available" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(
      <EmptyState
        title="No skill matches this search"
        action={{ label: 'Clear filters', onClick }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
