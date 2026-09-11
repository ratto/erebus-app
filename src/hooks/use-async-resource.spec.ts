import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiErrorKind } from '@/models/api-error';
import { useAsyncResource } from './use-async-resource';

/** A promise whose settlement the test controls. */
const defer = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('useAsyncResource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('runs the fetcher once on mount and exposes the result', async () => {
    const fetcher = vi.fn().mockResolvedValue('payload');

    const { result } = renderHook(() => useAsyncResource(fetcher, [fetcher]));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result.current.data).toBe('payload');
    expect(result.current.error).toBeNull();
  });

  it('normalises a rejection into an ApiError', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useAsyncResource(fetcher, [fetcher]));
    await waitFor(() => expect(result.current.status).toBe('error'));

    expect(result.current.error?.kind).toBe(ApiErrorKind.Server);
  });

  it('re-runs when a dependency changes', async () => {
    const fetcher = vi.fn().mockResolvedValue('payload');

    const { result, rerender } = renderHook(({ dep }) => useAsyncResource(fetcher, [dep]), {
      initialProps: { dep: 1 },
    });
    await waitFor(() => expect(result.current.status).toBe('ready'));

    rerender({ dep: 2 });
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  });

  it('ignores a resolution that arrives after unmount', async () => {
    const deferred = defer<string>();
    const fetcher = vi.fn(() => deferred.promise);

    const { result, unmount } = renderHook(() => useAsyncResource(fetcher, [fetcher]));
    unmount();
    await act(async () => {
      deferred.resolve('late payload');
      await deferred.promise;
    });

    expect(result.current.data).toBeNull();
    expect(result.current.status).toBe('loading');
  });

  it('ignores a rejection that arrives after unmount', async () => {
    const deferred = defer<string>();
    const fetcher = vi.fn(() => deferred.promise);

    const { result, unmount } = renderHook(() => useAsyncResource(fetcher, [fetcher]));
    unmount();
    await act(async () => {
      deferred.reject(new Error('late failure'));
      await deferred.promise.catch(() => undefined);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.status).toBe('loading');
  });
});
