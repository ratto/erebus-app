import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeProvider } from '@/hooks/use-theme';

/**
 * `ThemeToggle` is wrapped in the real `ThemeProvider` (not a fake), because
 * its only meaningful behaviour — flipping `data-theme` on `<html>` and its
 * own accessible name — only exists in the presence of the real context
 * (CONTRACT §4.3). The system-preference and storage-fallback branches are
 * already unit-tested by `javascript-developer` (`use-theme.spec.tsx`); this
 * suite covers only what a user sees and can do with the button itself.
 */
function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('states the accessible name as the target theme, given the (light) system default', () => {
    renderToggle();

    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument();
  });

  it('flips data-theme on <html> and the accessible name when activated by a pointer click', async () => {
    const user = userEvent.setup();
    renderToggle();

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
  });

  it('is keyboard-operable: Tab reaches it and Enter activates it', async () => {
    const user = userEvent.setup();
    renderToggle();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('persists only the explicit choice made by activating the button', async () => {
    const user = userEvent.setup();
    renderToggle();

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));

    expect(window.localStorage.getItem('erebus-theme')).toBe('dark');
  });

  it('toggles back and forth across repeated activations', async () => {
    const user = userEvent.setup();
    renderToggle();
    const button = () => screen.getByRole('button');

    await user.click(button());
    expect(button()).toHaveAccessibleName('Switch to light theme');

    await user.click(button());
    expect(button()).toHaveAccessibleName('Switch to dark theme');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
