import { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, ApiErrorKind } from './api-error';
import { HealthGateway } from './health.gateway';

const buildPayload = (overrides: Record<string, unknown> = {}) => ({
  status: 'ok',
  version: '1.0.0',
  uptimeMs: 41293,
  ...overrides,
});

const buildResponseError = (status: number): AxiosError =>
  new AxiosError('Request failed', 'ERR_BAD_RESPONSE', {} as InternalAxiosRequestConfig, null, {
    status,
    data: null,
    statusText: '',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  } as AxiosResponse);

describe('HealthGateway', () => {
  let client: AxiosInstance;
  let gateway: HealthGateway;

  beforeEach(() => {
    vi.clearAllMocks();
    client = { get: vi.fn() } as unknown as AxiosInstance;
    gateway = new HealthGateway(client);
  });

  describe('check', () => {
    it('requests the health endpoint exactly once, forwarding the abort signal', async () => {
      const signal = new AbortController().signal;
      vi.mocked(client.get).mockResolvedValue({ data: buildPayload() });

      await gateway.check(signal);

      expect(client.get).toHaveBeenCalledTimes(1);
      expect(client.get).toHaveBeenCalledWith('/health', { signal });
    });

    it('returns the health snapshot, carrying uptimeMs into the entity', async () => {
      vi.mocked(client.get).mockResolvedValue({ data: buildPayload() });

      const health = await gateway.check();

      expect(health).toEqual({ status: 'ok', version: '1.0.0', uptimeMs: 41293 });
    });

    it('treats a degraded API as a successful response', async () => {
      vi.mocked(client.get).mockResolvedValue({ data: buildPayload({ status: 'degraded' }) });

      await expect(gateway.check()).resolves.toMatchObject({ status: 'degraded' });
    });

    it('strips unknown extra keys so the API may add fields without breaking the app', async () => {
      vi.mocked(client.get).mockResolvedValue({
        data: buildPayload({ database: 'up', checkedAt: '2026-09-10T00:00:00.000Z' }),
      });

      const health = await gateway.check();

      expect(health).toEqual({ status: 'ok', version: '1.0.0', uptimeMs: 41293 });
    });

    it.each([
      ['an unknown status value', buildPayload({ status: 'exploded' })],
      ['a missing version', { status: 'ok', uptimeMs: 1 }],
      ['an empty version', buildPayload({ version: '' })],
      ['a negative uptimeMs', buildPayload({ uptimeMs: -1 })],
      ['a non-integer uptimeMs', buildPayload({ uptimeMs: 12.5 })],
    ])('rejects with a contract error on %s', async (_case, data) => {
      vi.mocked(client.get).mockResolvedValue({ data });

      await expect(gateway.check()).rejects.toMatchObject({ kind: ApiErrorKind.Contract });
    });

    it.each([
      [404, ApiErrorKind.NotFound],
      [400, ApiErrorKind.Validation],
      [503, ApiErrorKind.Server],
    ])('translates HTTP %s into an ApiError of kind %s', async (status, kind) => {
      vi.mocked(client.get).mockRejectedValue(buildResponseError(status));

      await expect(gateway.check()).rejects.toMatchObject({ kind, status });
    });

    it('translates a transport failure into a network ApiError', async () => {
      vi.mocked(client.get).mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'));

      await expect(gateway.check()).rejects.toMatchObject({ kind: ApiErrorKind.Network });
    });

    it('translates an aborted request into a timeout ApiError', async () => {
      vi.mocked(client.get).mockRejectedValue(new AxiosError('timeout', 'ECONNABORTED'));

      await expect(gateway.check()).rejects.toMatchObject({ kind: ApiErrorKind.Timeout });
    });

    it('never lets an AxiosError escape the Model layer', async () => {
      vi.mocked(client.get).mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'));

      await expect(gateway.check()).rejects.toBeInstanceOf(ApiError);
    });
  });
});
