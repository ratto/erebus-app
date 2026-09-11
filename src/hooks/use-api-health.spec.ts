import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, ApiErrorKind } from '@/models/api-error';
import type { HealthGateway } from '@/models/health.gateway';
import { logger } from '@/services/logger';
import { notify } from '@/services/notification';
import { useApiHealth } from './use-api-health';

const buildHealth = (overrides = {}) => ({
  status: 'ok' as const,
  version: '1.0.0',
  uptimeMs: 41293,
  ...overrides,
});

describe('useApiHealth', () => {
  let gateway: HealthGateway;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    gateway = { check: vi.fn() } as unknown as HealthGateway;
  });

  it('probes the API exactly once on mount — no polling, no automatic retry', async () => {
    vi.mocked(gateway.check).mockResolvedValue(buildHealth());

    const { result } = renderHook(() => useApiHealth({ gateway }));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(gateway.check).toHaveBeenCalledTimes(1);
  });

  it('exposes the API status and version once the probe succeeds', async () => {
    vi.mocked(gateway.check).mockResolvedValue(buildHealth());

    const { result } = renderHook(() => useApiHealth({ gateway }));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(result.current.apiStatus).toBe('ok');
    expect(result.current.version).toBe('1.0.0');
    expect(result.current.errorKind).toBeNull();
  });

  it('reports a degraded API as a ready state, not as an error', async () => {
    vi.mocked(gateway.check).mockResolvedValue(buildHealth({ status: 'degraded' }));

    const { result } = renderHook(() => useApiHealth({ gateway }));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(result.current.apiStatus).toBe('degraded');
    expect(result.current.errorKind).toBeNull();
  });

  it('starts in a loading state with no data', () => {
    vi.mocked(gateway.check).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useApiHealth({ gateway }));

    expect(result.current.status).toBe('loading');
    expect(result.current.apiStatus).toBeNull();
    expect(result.current.version).toBeNull();
  });

  it('exposes the failure kind, never the ApiError itself', async () => {
    vi.mocked(gateway.check).mockRejectedValue(
      new ApiError(ApiErrorKind.Network, 'The service could not be reached.'),
    );

    const { result } = renderHook(() => useApiHealth({ gateway }));
    await waitFor(() => expect(result.current.status).toBe('error'));

    expect(result.current.errorKind).toBe(ApiErrorKind.Network);
    expect(result.current).not.toHaveProperty('error');
  });

  it('logs exactly one error and raises no toast when the probe fails', async () => {
    const logError = vi.spyOn(logger, 'error').mockImplementation(() => {});
    const notifyError = vi.spyOn(notify, 'error').mockImplementation(() => {});
    const notifyInfo = vi.spyOn(notify, 'info').mockImplementation(() => {});
    vi.mocked(gateway.check).mockRejectedValue(new ApiError(ApiErrorKind.Contract, 'bad payload'));

    const { result } = renderHook(() => useApiHealth({ gateway }));
    await waitFor(() => expect(result.current.status).toBe('error'));

    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ kind: ApiErrorKind.Contract, route: '/health' }),
    );
    expect(notifyError).not.toHaveBeenCalled();
    expect(notifyInfo).not.toHaveBeenCalled();
  });

  it('does not log when the probe succeeds', async () => {
    const logError = vi.spyOn(logger, 'error').mockImplementation(() => {});
    vi.mocked(gateway.check).mockResolvedValue(buildHealth());

    const { result } = renderHook(() => useApiHealth({ gateway }));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(logError).not.toHaveBeenCalled();
  });

  it('re-issues the probe when reload is called', async () => {
    vi.mocked(gateway.check).mockResolvedValue(buildHealth());

    const { result } = renderHook(() => useApiHealth({ gateway }));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    act(() => result.current.reload());
    await waitFor(() => expect(gateway.check).toHaveBeenCalledTimes(2));
  });

  it('aborts the in-flight probe when the consumer unmounts', async () => {
    let captured: AbortSignal | undefined;
    vi.mocked(gateway.check).mockImplementation((signal?: AbortSignal) => {
      captured = signal;
      return new Promise(() => {});
    });

    const { unmount } = renderHook(() => useApiHealth({ gateway }));
    expect(captured?.aborted).toBe(false);

    unmount();

    expect(captured?.aborted).toBe(true);
  });
});
