import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { http } from '@/services/http';
import { toApiError } from './api-error';
import type { HealthStatus } from './health';
import { healthDtoSchema } from './health.schema';

/**
 * Encapsulates the health endpoint of erebus-api.
 *
 * Reference for WIRING only. LLD §7 (the melee-weapon slice) remains the only
 * reference for adding a catalogue entity: this gateway has **no mapper**
 * because the schema output *is* the entity (no vocabulary divergence, no
 * derived field, no provenance) — an exemption scoped to operational payloads
 * by ADR-003. Copying it into an entity is a review rejection (LLD §12.5).
 */
export class HealthGateway {
  private readonly client: AxiosInstance;

  /**
   * The default argument is the production wiring; tests pass a fake.
   *
   * LLD §7.4 writes this as a TypeScript parameter property; the scaffold's
   * `erasableSyntaxOnly` compiler option forbids that syntax, so the field is
   * declared explicitly. The public surface is identical.
   */
  constructor(client: AxiosInstance = http) {
    this.client = client;
  }

  /**
   * Probes the API once.
   *
   * @throws ApiError — never an AxiosError, never a ZodError.
   */
  async check(signal?: AbortSignal): Promise<HealthStatus> {
    try {
      // `exactOptionalPropertyTypes` forbids passing an explicit `undefined`
      // signal, so the key is omitted when the caller supplies none.
      const requestConfig: AxiosRequestConfig = signal ? { signal } : {};
      const { data } = await this.client.get<unknown>('/health', requestConfig);
      return healthDtoSchema.parse(data);
    } catch (error) {
      throw toApiError(error);
    }
  }
}

/** Production singleton — what useApiHealth imports by default. */
export const healthGateway = new HealthGateway();
