import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, ApiErrorKind } from '@/models/api-error';
import type { SkillDetail } from '@/models/skill';
import type { SkillGateway } from '@/models/skill.gateway';
import { logger } from '@/services/logger';
import { notify } from '@/services/notification';
import { useSkill } from './use-skill';

const buildDetail = (overrides: Partial<SkillDetail> = {}): SkillDetail => ({
  id: 12,
  name: 'Condução',
  parentSkillId: null,
  parentSkillName: null,
  hasSubgroups: true,
  baseAttribute: 'AGI',
  effectiveBaseAttribute: 'AGI',
  category: null,
  description: 'Perícia de grupo para operar veículos.',
  initialValueType: 'instinctive',
  prerequisite: null,
  damage: null,
  notes: null,
  sourceLevel: 1,
  source: 'pericias.json → lista · manual l.809',
  editionOrVersion: 'Manual Básico 1.04 (dez/2022)',
  subgroups: [],
  ...overrides,
});

describe('useSkill', () => {
  let gateway: SkillGateway;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.spyOn(logger, 'error').mockImplementation(() => {});
    vi.spyOn(notify, 'error').mockImplementation(() => {});
    gateway = { list: vi.fn(), findById: vi.fn() } as unknown as SkillGateway;
  });

  it('fetches the skill of the given id exactly once', async () => {
    vi.mocked(gateway.findById).mockResolvedValue(buildDetail());

    const { result } = renderHook(() => useSkill(12, { gateway }));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(gateway.findById).toHaveBeenCalledTimes(1);
    expect(gateway.findById).toHaveBeenCalledWith(12, expect.any(AbortSignal));
    expect(result.current.item?.name).toBe('Condução');
  });

  it('exposes the subgroups the API returned', async () => {
    const detail = buildDetail({
      subgroups: [
        {
          ...buildDetail({ id: 41, name: 'Automóvel', category: 'condução' }),
          parentSkillId: 12,
          parentSkillName: 'Condução',
          hasSubgroups: false,
        },
      ],
    });
    vi.mocked(gateway.findById).mockResolvedValue(detail);

    const { result } = renderHook(() => useSkill(12, { gateway }));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(result.current.item?.subgroups).toHaveLength(1);
  });

  it('groups the subgroups by their N3 category so the View never derives it', async () => {
    const subgroup = (id: number, name: string, category: string) => ({
      ...buildDetail({ id, name, category, hasSubgroups: false }),
      parentSkillId: 12,
      parentSkillName: 'Condução',
    });
    vi.mocked(gateway.findById).mockResolvedValue(
      buildDetail({
        subgroups: [
          subgroup(41, 'Automóvel', 'condução'),
          subgroup(43, 'Avião', 'pilotagem'),
          subgroup(42, 'Ônibus', 'condução'),
        ],
      }),
    );

    const { result } = renderHook(() => useSkill(12, { gateway }));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(
      result.current.subgroupsByCategory.map((node) => [
        node.category,
        node.subgroups.map((skill) => skill.name),
      ]),
    ).toEqual([
      ['condução', ['Automóvel', 'Ônibus']],
      ['pilotagem', ['Avião']],
    ]);
  });

  it('exposes no category group for a leaf', async () => {
    vi.mocked(gateway.findById).mockResolvedValue(buildDetail({ hasSubgroups: false }));

    const { result } = renderHook(() => useSkill(12, { gateway }));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(result.current.subgroupsByCategory).toEqual([]);
  });

  it('exposes no category group before the request resolves', () => {
    vi.mocked(gateway.findById).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useSkill(12, { gateway }));

    expect(result.current.subgroupsByCategory).toEqual([]);
  });

  it('starts in a loading state with no item', () => {
    vi.mocked(gateway.findById).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useSkill(12, { gateway }));

    expect(result.current.status).toBe('loading');
    expect(result.current.item).toBeNull();
    expect(result.current.notFound).toBe(false);
  });

  it('flags a 404 as notFound', async () => {
    vi.mocked(gateway.findById).mockRejectedValue(
      new ApiError(ApiErrorKind.NotFound, 'gone', 404, null),
    );

    const { result } = renderHook(() => useSkill(999, { gateway }));
    await waitFor(() => expect(result.current.status).toBe('error'));

    expect(result.current.notFound).toBe(true);
    expect(result.current.item).toBeNull();
  });

  it('does not flag other failures as notFound', async () => {
    vi.mocked(gateway.findById).mockRejectedValue(
      new ApiError(ApiErrorKind.Contract, 'bad shape', null, null),
    );

    const { result } = renderHook(() => useSkill(12, { gateway }));
    await waitFor(() => expect(result.current.status).toBe('error'));

    expect(result.current.notFound).toBe(false);
    expect(result.current.error?.kind).toBe(ApiErrorKind.Contract);
  });

  it('logs and announces a failure exactly once', async () => {
    vi.mocked(gateway.findById).mockRejectedValue(
      new ApiError(ApiErrorKind.Server, 'boom', 500, null),
    );

    const { result } = renderHook(() => useSkill(12, { gateway }));
    await waitFor(() => expect(result.current.status).toBe('error'));

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(notify.error).toHaveBeenCalledTimes(1);
  });

  it('re-issues the request on reload', async () => {
    vi.mocked(gateway.findById).mockResolvedValue(buildDetail());

    const { result } = renderHook(() => useSkill(12, { gateway }));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    act(() => result.current.reload());
    await waitFor(() => expect(gateway.findById).toHaveBeenCalledTimes(2));
  });

  it('re-fetches when the id changes', async () => {
    vi.mocked(gateway.findById).mockResolvedValue(buildDetail());

    const { result, rerender } = renderHook(({ id }: { id: number }) => useSkill(id, { gateway }), {
      initialProps: { id: 12 },
    });
    await waitFor(() => expect(result.current.status).toBe('ready'));

    rerender({ id: 41 });
    await waitFor(() => expect(gateway.findById).toHaveBeenCalledWith(41, expect.any(AbortSignal)));
  });
});
