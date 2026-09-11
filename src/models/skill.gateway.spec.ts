import type { AxiosInstance } from 'axios';
import { AxiosError } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiErrorKind } from './api-error';
import { SkillGateway } from './skill.gateway';

const buildDto = (overrides: Record<string, unknown> = {}) => ({
  id: 41,
  name: 'Automóvel',
  parentSkillId: 12,
  parentSkillName: 'Condução',
  hasSubgroups: false,
  baseAttribute: 'AGI',
  effectiveBaseAttribute: 'AGI',
  category: 'condução',
  description: 'Dirigir automóvel em condições normais de uso e de trânsito.',
  initialValueType: 'instinctive',
  prerequisite: null,
  damage: null,
  notes: null,
  sourceLevel: 1,
  source: 'pericias.json → Condução.subgrupos · manual l.809',
  editionOrVersion: 'Manual Básico 1.04 (dez/2022)',
  ...overrides,
});

const buildNotFoundError = () => {
  const error = new AxiosError('Request failed with status code 404');
  error.response = {
    status: 404,
    statusText: 'Not Found',
    headers: {},
    config: { headers: {} } as never,
    data: {
      type: 'https://erebus.dev/problems/not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Skill with id 999 was not found.',
      instance: '/v1/skills/999',
    },
  };

  return error;
};

describe('SkillGateway', () => {
  let client: AxiosInstance;
  let gateway: SkillGateway;

  beforeEach(() => {
    vi.clearAllMocks();
    client = { get: vi.fn() } as unknown as AxiosInstance;
    gateway = new SkillGateway(client);
  });

  describe('list', () => {
    it('requests the whole collection without any query parameter', async () => {
      vi.mocked(client.get).mockResolvedValue({ data: [] });

      await gateway.list();

      expect(client.get).toHaveBeenCalledTimes(1);
      // No signal was passed, so the config object is empty — never
      // { signal: undefined }, which exactOptionalPropertyTypes forbids (LLD §7.4).
      expect(client.get).toHaveBeenCalledWith('/skills', {});
    });

    it('forwards the abort signal it is given', async () => {
      vi.mocked(client.get).mockResolvedValue({ data: [] });
      const { signal } = new AbortController();

      await gateway.list(signal);

      expect(client.get).toHaveBeenCalledWith('/skills', { signal });
    });

    it('maps every payload element onto an entity, preserving provenance', async () => {
      vi.mocked(client.get).mockResolvedValue({ data: [buildDto()] });

      const [skill] = await gateway.list();

      expect(skill).toMatchObject({
        id: 41,
        name: 'Automóvel',
        parentSkillName: 'Condução',
        effectiveBaseAttribute: 'AGI',
        sourceLevel: 1,
      });
    });

    it('rejects with a contract error when a required field is missing', async () => {
      vi.mocked(client.get).mockResolvedValue({ data: [{ id: 1, name: 'Condução' }] });

      await expect(gateway.list()).rejects.toMatchObject({ kind: ApiErrorKind.Contract });
    });

    it('rejects with a contract error when sourceLevel is 4', async () => {
      vi.mocked(client.get).mockResolvedValue({ data: [buildDto({ sourceLevel: 4 })] });

      await expect(gateway.list()).rejects.toMatchObject({ kind: ApiErrorKind.Contract });
    });

    it('rejects with a contract error when the payload is not an array', async () => {
      vi.mocked(client.get).mockResolvedValue({ data: buildDto() });

      await expect(gateway.list()).rejects.toMatchObject({ kind: ApiErrorKind.Contract });
    });
  });

  describe('findById', () => {
    it('requests the detail route of the given id', async () => {
      vi.mocked(client.get).mockResolvedValue({ data: { ...buildDto(), subgroups: [] } });

      await gateway.findById(41);

      expect(client.get).toHaveBeenCalledWith('/skills/41', {});
    });

    it('forwards the abort signal it is given', async () => {
      vi.mocked(client.get).mockResolvedValue({ data: { ...buildDto(), subgroups: [] } });
      const { signal } = new AbortController();

      await gateway.findById(41, signal);

      expect(client.get).toHaveBeenCalledWith('/skills/41', { signal });
    });

    it('returns the detail entity with its subgroups mapped', async () => {
      vi.mocked(client.get).mockResolvedValue({
        data: {
          ...buildDto({ id: 12, name: 'Condução', parentSkillId: null, parentSkillName: null }),
          hasSubgroups: true,
          subgroups: [buildDto()],
        },
      });

      const detail = await gateway.findById(12);

      expect(detail.name).toBe('Condução');
      expect(detail.subgroups).toHaveLength(1);
      expect(detail.subgroups[0]?.name).toBe('Automóvel');
    });

    it('rejects with a not-found error when the API returns 404', async () => {
      vi.mocked(client.get).mockRejectedValue(buildNotFoundError());

      await expect(gateway.findById(999)).rejects.toMatchObject({
        kind: ApiErrorKind.NotFound,
        status: 404,
      });
    });

    it('rejects with a contract error when subgroups is missing from the detail payload', async () => {
      vi.mocked(client.get).mockResolvedValue({ data: buildDto() });

      await expect(gateway.findById(41)).rejects.toMatchObject({ kind: ApiErrorKind.Contract });
    });
  });
});
