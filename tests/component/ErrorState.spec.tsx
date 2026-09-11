import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorState } from '@/components/ErrorState';
import { ApiErrorKind } from '@/models/api-error';

describe('ErrorState', () => {
  it.each([
    [ApiErrorKind.Network, 'The catalogue service could not be reached'],
    [ApiErrorKind.Timeout, 'The request took too long'],
    [ApiErrorKind.NotFound, 'This record no longer exists'],
    [ApiErrorKind.Validation, 'The request was rejected'],
    [ApiErrorKind.Contract, 'The catalogue answered in an unexpected shape'],
    [ApiErrorKind.Server, 'The catalogue service failed'],
  ])('renders a distinct title for kind %s, never the raw API message', (kind, title) => {
    render(<ErrorState kind={kind} onRetry={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent(title);
  });

  it('every kind produces a mutually distinct message', () => {
    const kinds = Object.values(ApiErrorKind);
    const titles = kinds.map((kind) => {
      const { unmount, getByRole } = render(<ErrorState kind={kind} onRetry={vi.fn()} />);
      const text = getByRole('alert').textContent;
      unmount();
      return text;
    });

    expect(new Set(titles).size).toBe(titles.length);
  });

  it('renders a working retry action, never an automatic retry', async () => {
    const onRetry = vi.fn();
    render(<ErrorState kind={ApiErrorKind.Network} onRetry={onRetry} />);

    expect(onRetry).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
