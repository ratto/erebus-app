import axios from 'axios';
import { ZodError } from 'zod';

/** The finite set of failures the Model layer can produce (LLD §7.2). */
export const ApiErrorKind = {
  /** No response at all: offline, DNS, CORS, API down. */
  Network: 'network',
  /** The request exceeded config.requestTimeoutMs. */
  Timeout: 'timeout',
  /** 404 — the resource does not exist. */
  NotFound: 'not-found',
  /** 400 — the API rejected our parameters. A bug in this app. */
  Validation: 'validation',
  /** The payload did not match the schema. The API contract changed. */
  Contract: 'contract',
  /** 5xx or anything else unexpected. */
  Server: 'server',
} as const;
export type ApiErrorKind = (typeof ApiErrorKind)[keyof typeof ApiErrorKind];

/** RFC 7807 body returned by erebus-api. `detail` MAY be logged, never rendered. */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: { field: string; message: string }[];
}

/** The single error shape that crosses the Model boundary. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  readonly problem: ProblemDetails | null;

  constructor(
    kind: ApiErrorKind,
    message: string,
    status: number | null = null,
    problem: ProblemDetails | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.problem = problem;
  }
}

const isProblemDetails = (data: unknown): data is ProblemDetails =>
  typeof data === 'object' && data !== null && 'title' in data && 'status' in data;

/** Normalises every failure the Model layer can produce into one shape. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof ZodError) {
    return new ApiError(
      ApiErrorKind.Contract,
      `The API response did not match the expected contract: ${error.message}`,
    );
  }

  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return new ApiError(ApiErrorKind.Timeout, 'The request timed out.');
    }
    if (!error.response) {
      return new ApiError(ApiErrorKind.Network, 'The service could not be reached.');
    }
    const { status, data } = error.response;
    const problem = isProblemDetails(data) ? data : null;
    const kind =
      status === 404
        ? ApiErrorKind.NotFound
        : status === 400
          ? ApiErrorKind.Validation
          : ApiErrorKind.Server;
    return new ApiError(kind, problem?.detail ?? error.message, status, problem);
  }

  return new ApiError(ApiErrorKind.Server, 'An unexpected error occurred.');
}
