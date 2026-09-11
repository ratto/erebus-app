import axios from 'axios';
import { toApiError } from '@/models/api-error';
import { config } from './config';

/** The single Axios instance of the application. There MUST NOT be a second. */
export const http = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.requestTimeoutMs,
  headers: { Accept: 'application/json' },
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);
