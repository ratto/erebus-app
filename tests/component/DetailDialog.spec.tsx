import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DetailDialog } from '@/components/DetailDialog';

/**
 * Mirrors the real navigation shape: the row/opener is focused first, then the
 * dialog mounts (as it does when a route change renders it), and unmounts on
 * close — the moment `DetailDialog` restores focus to whatever was active
 * when it first mounted.
 */
function OpenerAndDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open Condução
      </button>
      {open && (
        <DetailDialog title="Condução" onClose={() => setOpen(false)}>
          content
        </DetailDialog>
      )}
    </>
  );
}

describe('DetailDialog', () => {
  it('carries the dialog role, aria-modal and an aria-labelledby pointing at the title', () => {
    render(
      <DetailDialog title="Condução" onClose={vi.fn()}>
        content
      </DetailDialog>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Condução' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('moves focus into the panel on mount', () => {
    render(
      <DetailDialog title="Condução" onClose={vi.fn()}>
        content
      </DetailDialog>,
    );

    expect(screen.getByRole('dialog', { name: 'Condução' })).toHaveFocus();
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(
      <DetailDialog title="Condução" onClose={onClose}>
        content
      </DetailDialog>,
    );

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the Close button is activated', async () => {
    const onClose = vi.fn();
    render(
      <DetailDialog title="Condução" onClose={onClose}>
        content
      </DetailDialog>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('traps Tab inside the panel: from the last focusable element it cycles back to the first', async () => {
    render(
      <DetailDialog title="Condução" onClose={vi.fn()}>
        content
      </DetailDialog>,
    );

    // The Close button is the only focusable element in this minimal render,
    // so Tab from it must cycle back to itself, not escape the dialog.
    const close = screen.getByRole('button', { name: 'Close' });
    close.focus();

    await userEvent.tab();

    expect(close).toHaveFocus();
  });

  it('restores focus to the triggering row when the dialog closes', async () => {
    render(<OpenerAndDialog />);

    const opener = screen.getByRole('button', { name: 'Open Condução' });
    await userEvent.click(opener);

    expect(await screen.findByRole('dialog', { name: 'Condução' })).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});
