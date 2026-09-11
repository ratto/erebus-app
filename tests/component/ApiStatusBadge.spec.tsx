import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApiStatusBadge } from '@/components/ApiStatusBadge';
import { useApiHealth } from '@/hooks/use-api-health';
import type { ApiHealthViewModel } from '@/hooks/use-api-health';
import { ApiErrorKind } from '@/models/api-error';

/**
 * `ApiStatusBadge` takes no props (LLD §8.7 — it destructures the hook itself),
 * so there is no explicit-props seam to drive it through, unlike a component
 * that receives a ViewModel as a prop. The hook module is mocked instead: this
 * is the View-isolation equivalent of "explicit props" for a component whose
 * only input is a hook return value (LLD §10.3 intent, adapted to this shape).
 */
vi.mock('@/hooks/use-api-health', () => ({ useApiHealth: vi.fn() }));

const mockedUseApiHealth = vi.mocked(useApiHealth);

const buildViewModel = (overrides: Partial<ApiHealthViewModel> = {}): ApiHealthViewModel => ({
  status: 'loading',
  apiStatus: null,
  version: null,
  errorKind: null,
  reload: vi.fn(),
  ...overrides,
});

describe('ApiStatusBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a busy, live "checking" status while the probe is pending', () => {
    mockedUseApiHealth.mockReturnValue(buildViewModel({ status: 'loading' }));

    render(<ApiStatusBadge />);

    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Checking API…');
    expect(badge).toHaveAttribute('aria-live', 'polite');
    expect(badge).toHaveAttribute('aria-busy', 'true');
  });

  it('renders the online state including the reported version', () => {
    mockedUseApiHealth.mockReturnValue(
      buildViewModel({ status: 'ready', apiStatus: 'ok', version: '1.0.0' }),
    );

    render(<ApiStatusBadge />);

    expect(screen.getByRole('status')).toHaveTextContent('API online · v1.0.0');
  });

  it('treats the degraded API state as a success, not an error (CONTRACT §2)', () => {
    mockedUseApiHealth.mockReturnValue(
      buildViewModel({ status: 'ready', apiStatus: 'degraded', version: '1.0.0' }),
    );

    render(<ApiStatusBadge />);

    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('API degraded');
    expect(badge).not.toHaveAttribute('aria-busy');
  });

  it.each([
    [ApiErrorKind.Network, 'API unreachable'],
    [ApiErrorKind.Timeout, 'API timed out'],
    [ApiErrorKind.Contract, 'Unexpected API response'],
    [ApiErrorKind.NotFound, 'API error'],
    [ApiErrorKind.Validation, 'API error'],
    [ApiErrorKind.Server, 'API error'],
  ])(
    'renders copy chosen from errorKind %s, never a raw message or problem detail',
    (kind, copy) => {
      mockedUseApiHealth.mockReturnValue(buildViewModel({ status: 'error', errorKind: kind }));

      render(<ApiStatusBadge />);

      expect(screen.getByRole('status')).toHaveTextContent(copy);
    },
  );

  it('offers no retry affordance on failure (PLAN D6 — no polling, no automatic retry)', () => {
    mockedUseApiHealth.mockReturnValue(
      buildViewModel({ status: 'error', errorKind: ApiErrorKind.Network }),
    );

    render(<ApiStatusBadge />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('does not crash the layout when the hook has not resolved yet and errorKind is null', () => {
    mockedUseApiHealth.mockReturnValue(buildViewModel({ status: 'error', errorKind: null }));

    render(<ApiStatusBadge />);

    expect(screen.getByRole('status')).toHaveTextContent('API error');
  });

  it('is legible without colour: every one of the four states renders a distinct text label', () => {
    const states: ApiHealthViewModel[] = [
      buildViewModel({ status: 'loading' }),
      buildViewModel({ status: 'ready', apiStatus: 'ok', version: '1.0.0' }),
      buildViewModel({ status: 'ready', apiStatus: 'degraded', version: '1.0.0' }),
      buildViewModel({ status: 'error', errorKind: ApiErrorKind.Network }),
    ];

    const labels = states.map((viewModel) => {
      mockedUseApiHealth.mockReturnValue(viewModel);
      const { unmount, getByRole } = render(<ApiStatusBadge />);
      const text = getByRole('status').textContent;
      unmount();
      return text;
    });

    expect(new Set(labels).size).toBe(labels.length);
  });
});
