import { AxiosError } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ApiError, ApiErrorKind, toApiError } from './api-error';
import type { ProblemDetails } from './api-error';

const buildProblem = (overrides: Partial<ProblemDetails> = {}): ProblemDetails => ({
  type: 'https://erebus.example/problems/not-found',
  title: 'Not Found',
  status: 404,
  detail: 'Melee weapon 42 does not exist.',
  instance: '/v1/melee-weapons/42',
  ...overrides,
});

/** Test double: a real AxiosError carrying a response with the given status/body. */
const buildResponseError = (status: number, data: unknown): AxiosError =>
  new AxiosError('Request failed', 'ERR_BAD_RESPONSE', {} as InternalAxiosRequestConfig, null, {
    status,
    data,
    statusText: '',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  } as AxiosResponse);

const buildZodError = (): z.ZodError => {
  const result = z.object({ version: z.string() }).safeParse({ version: 1 });
  if (result.success) throw new Error('The fixture must produce a ZodError.');
  return result.error;
};

describe('toApiError', () => {
  it('returns an ApiError unchanged', () => {
    const original = new ApiError(ApiErrorKind.NotFound, 'gone', 404, null);

    expect(toApiError(original)).toBe(original);
  });

  it('classifies a ZodError as a contract violation', () => {
    const error = toApiError(buildZodError());

    expect(error).toBeInstanceOf(ApiError);
    expect(error.kind).toBe(ApiErrorKind.Contract);
    expect(error.status).toBeNull();
    expect(error.problem).toBeNull();
  });

  it('classifies an aborted request as a timeout', () => {
    const error = toApiError(new AxiosError('timeout of 8000ms exceeded', 'ECONNABORTED'));

    expect(error.kind).toBe(ApiErrorKind.Timeout);
    expect(error.status).toBeNull();
  });

  it('classifies an AxiosError with no response as a network failure', () => {
    const error = toApiError(new AxiosError('Network Error', 'ERR_NETWORK'));

    expect(error.kind).toBe(ApiErrorKind.Network);
    expect(error.status).toBeNull();
  });

  it('classifies a 404 as not-found and keeps the problem document', () => {
    const problem = buildProblem();

    const error = toApiError(buildResponseError(404, problem));

    expect(error.kind).toBe(ApiErrorKind.NotFound);
    expect(error.status).toBe(404);
    expect(error.problem).toEqual(problem);
    expect(error.message).toBe(problem.detail);
  });

  it('classifies a 400 as a validation failure', () => {
    const error = toApiError(buildResponseError(400, buildProblem({ status: 400 })));

    expect(error.kind).toBe(ApiErrorKind.Validation);
    expect(error.status).toBe(400);
  });

  it('classifies any other status as a server failure', () => {
    const error = toApiError(buildResponseError(503, buildProblem({ status: 503 })));

    expect(error.kind).toBe(ApiErrorKind.Server);
    expect(error.status).toBe(503);
  });

  it('falls back to the Axios message when the body is not a problem document', () => {
    const error = toApiError(buildResponseError(500, 'plain text body'));

    expect(error.kind).toBe(ApiErrorKind.Server);
    expect(error.problem).toBeNull();
    expect(error.message).toBe('Request failed');
  });

  it.each([[null], ['a string'], [new Error('boom')], [42]])(
    'classifies unrecognised input (%s) as a server failure',
    (input) => {
      const error = toApiError(input);

      expect(error.kind).toBe(ApiErrorKind.Server);
      expect(error.status).toBeNull();
      expect(error.problem).toBeNull();
    },
  );

  it('exposes ApiError as a real Error with a stable name', () => {
    const error = toApiError(new AxiosError('Network Error', 'ERR_NETWORK'));

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
  });
});
