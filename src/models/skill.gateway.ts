import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { http } from '@/services/http';
import { toApiError } from './api-error';
import type { Skill, SkillDetail } from './skill';
import { toSkill, toSkillDetail } from './skill.mapper';
import { skillDetailDtoSchema, skillListDtoSchema } from './skill.schema';

/**
 * Encapsulates every HTTP call to the skill endpoints of erebus-api.
 *
 * Returns Entities. Never leaks a DTO, an AxiosError or an AxiosResponse
 * (LLD §7.4). `findById` returns `SkillDetail` rather than `Skill`, because the
 * detail payload is a superset of the list shape — the documented specialisation
 * of the reference slice for `Skill` and `Enhancement` (LLD §6.3).
 */
export class SkillGateway {
  private readonly client: AxiosInstance;

  /**
   * The default argument is the production wiring; tests pass a fake.
   *
   * The field is declared and assigned here rather than written as a constructor
   * parameter property, which `erasableSyntaxOnly` forbids (LLD §7.4).
   */
  constructor(client: AxiosInstance = http) {
    this.client = client;
  }

  /**
   * Fetches the whole catalogue. Takes **no filter**: Phase 1 loads once and
   * filters in memory, so a filter parameter here would be dead code with two
   * competing filter paths (LLD §7.4, PLAN D8).
   *
   * @throws ApiError — never an AxiosError, never a ZodError.
   */
  async list(signal?: AbortSignal): Promise<Skill[]> {
    try {
      const { data } = await this.client.get<unknown>('/skills', this.requestConfig(signal));
      return skillListDtoSchema.parse(data).map(toSkill);
    } catch (error) {
      throw toApiError(error);
    }
  }

  /**
   * Fetches one skill with its subgroups.
   *
   * @throws ApiError — `kind: 'not-found'` when no skill has that id.
   */
  async findById(id: number, signal?: AbortSignal): Promise<SkillDetail> {
    try {
      const { data } = await this.client.get<unknown>(`/skills/${id}`, this.requestConfig(signal));
      return toSkillDetail(skillDetailDtoSchema.parse(data));
    } catch (error) {
      throw toApiError(error);
    }
  }

  /**
   * `exactOptionalPropertyTypes` forbids passing an explicit `undefined` signal,
   * so the key is omitted when the caller supplies none.
   */
  private requestConfig(signal?: AbortSignal): AxiosRequestConfig {
    return signal ? { signal } : {};
  }
}

/** Production singleton — what every skill hook imports by default. */
export const skillGateway = new SkillGateway();
