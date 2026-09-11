import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, ApiErrorKind } from '@/models/api-error';
import type { Skill } from '@/models/skill';
import type { SkillGateway } from '@/models/skill.gateway';
import { logger } from '@/services/logger';
import { notify } from '@/services/notification';
import { useSkills } from './use-skills';

const buildSkill = (overrides: Partial<Skill> = {}): Skill => ({
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

const conducao = buildSkill({
  id: 12,
  name: 'Condução',
  parentSkillId: null,
  parentSkillName: null,
  hasSubgroups: true,
  category: null,
});
const automovel = buildSkill();
const onibus = buildSkill({ id: 42, name: 'Ônibus', baseAttribute: null });
const explosivos = buildSkill({
  id: 7,
  name: 'Explosivos',
  parentSkillId: null,
  parentSkillName: null,
  hasSubgroups: false,
  baseAttribute: null,
  effectiveBaseAttribute: null,
  category: null,
  sourceLevel: 3,
});
const zoologia = buildSkill({
  id: 90,
  name: 'Zoologia',
  parentSkillId: null,
  parentSkillName: null,
  baseAttribute: 'INT',
  effectiveBaseAttribute: 'INT',
  category: null,
});

const renderSkills = (initialPath = '/skills', gateway?: SkillGateway) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
  );

  return renderHook(
    () => ({
      vm: useSkills(gateway ? { gateway } : {}),
      search: useLocation().search,
    }),
    { wrapper },
  );
};

describe('useSkills', () => {
  let gateway: SkillGateway;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.spyOn(logger, 'error').mockImplementation(() => {});
    vi.spyOn(notify, 'error').mockImplementation(() => {});
    gateway = { list: vi.fn(), findById: vi.fn() } as unknown as SkillGateway;
  });

  it('loads the whole catalogue with a single request', async () => {
    vi.mocked(gateway.list).mockResolvedValue([conducao, automovel]);

    const { result } = renderSkills('/skills', gateway);
    await waitFor(() => expect(result.current.vm.status).toBe('ready'));

    expect(gateway.list).toHaveBeenCalledTimes(1);
    expect(result.current.vm.total).toBe(2);
  });

  it('sorts the items with Portuguese collation', async () => {
    vi.mocked(gateway.list).mockResolvedValue([zoologia, onibus, automovel]);

    const { result } = renderSkills('/skills', gateway);
    await waitFor(() => expect(result.current.vm.status).toBe('ready'));

    expect(result.current.vm.items.map((skill) => skill.name)).toEqual([
      'Automóvel',
      'Ônibus',
      'Zoologia',
    ]);
  });

  it('filters by name in memory, without issuing a second request', async () => {
    vi.mocked(gateway.list).mockResolvedValue([conducao, automovel, onibus]);

    const { result } = renderSkills('/skills', gateway);
    await waitFor(() => expect(result.current.vm.status).toBe('ready'));

    act(() => result.current.vm.setName('automovel'));

    expect(result.current.vm.items.map((skill) => skill.name)).toEqual(['Automóvel']);
    expect(gateway.list).toHaveBeenCalledTimes(1);
  });

  it('reflects the searched name in the URL', async () => {
    vi.mocked(gateway.list).mockResolvedValue([conducao, automovel]);

    const { result } = renderSkills('/skills', gateway);
    await waitFor(() => expect(result.current.vm.status).toBe('ready'));

    act(() => result.current.vm.setName('cond'));

    expect(result.current.search).toBe('?name=cond');
  });

  it('reads the filter already present in the URL on first render', async () => {
    vi.mocked(gateway.list).mockResolvedValue([conducao, automovel]);

    const { result } = renderSkills('/skills?name=cond', gateway);
    await waitFor(() => expect(result.current.vm.status).toBe('ready'));

    expect(result.current.vm.filter.name).toBe('cond');
    expect(result.current.vm.items.map((skill) => skill.name)).toEqual(['Condução']);
  });

  it('filters by the base attribute a subgroup inherits from its group', async () => {
    vi.mocked(gateway.list).mockResolvedValue([conducao, onibus, zoologia]);

    const { result } = renderSkills('/skills', gateway);
    await waitFor(() => expect(result.current.vm.status).toBe('ready'));

    act(() => result.current.vm.setBaseAttribute('AGI'));

    expect(result.current.vm.items.map((skill) => skill.name)).toEqual(['Condução', 'Ônibus']);
    expect(result.current.search).toBe('?baseAttribute=AGI');
  });

  it('filters by source level', async () => {
    vi.mocked(gateway.list).mockResolvedValue([conducao, explosivos]);

    const { result } = renderSkills('/skills', gateway);
    await waitFor(() => expect(result.current.vm.status).toBe('ready'));

    act(() => result.current.vm.setSourceLevel(3));

    expect(result.current.vm.items.map((skill) => skill.name)).toEqual(['Explosivos']);
  });

  it('exposes the group → subgroup hierarchy so the View never derives it', async () => {
    vi.mocked(gateway.list).mockResolvedValue([automovel, conducao, onibus, explosivos]);

    const { result } = renderSkills('/skills', gateway);
    await waitFor(() => expect(result.current.vm.status).toBe('ready'));

    expect(
      result.current.vm.groups.map((node) => [
        node.skill.name,
        node.subgroups.map((skill) => skill.name),
      ]),
    ).toEqual([
      ['Condução', ['Automóvel', 'Ônibus']],
      ['Explosivos', []],
    ]);
  });

  it('derives the distinct base attributes present, for the filter control', async () => {
    vi.mocked(gateway.list).mockResolvedValue([conducao, onibus, zoologia, explosivos]);

    const { result } = renderSkills('/skills', gateway);
    await waitFor(() => expect(result.current.vm.status).toBe('ready'));

    expect(result.current.vm.baseAttributeOptions).toEqual(['AGI', 'INT']);
  });

  it('reports the match count against the untouched total', async () => {
    vi.mocked(gateway.list).mockResolvedValue([conducao, automovel, onibus]);

    const { result } = renderSkills('/skills', gateway);
    await waitFor(() => expect(result.current.vm.status).toBe('ready'));

    act(() => result.current.vm.setName('cond'));

    expect(result.current.vm.matchCount).toBe(1);
    expect(result.current.vm.total).toBe(3);
  });

  it('distinguishes "no matches" from "no data" through isFiltered', async () => {
    vi.mocked(gateway.list).mockResolvedValue([conducao]);

    const { result } = renderSkills('/skills', gateway);
    await waitFor(() => expect(result.current.vm.status).toBe('ready'));

    expect(result.current.vm.isEmpty).toBe(false);
    expect(result.current.vm.isFiltered).toBe(false);

    act(() => result.current.vm.setName('inexistente'));

    expect(result.current.vm.isEmpty).toBe(true);
    expect(result.current.vm.isFiltered).toBe(true);
  });

  it('reports an empty catalogue as empty and unfiltered', async () => {
    vi.mocked(gateway.list).mockResolvedValue([]);

    const { result } = renderSkills('/skills', gateway);
    await waitFor(() => expect(result.current.vm.status).toBe('ready'));

    expect(result.current.vm.isEmpty).toBe(true);
    expect(result.current.vm.isFiltered).toBe(false);
  });

  it('is not empty while the request is still in flight', () => {
    vi.mocked(gateway.list).mockReturnValue(new Promise(() => {}));

    const { result } = renderSkills('/skills', gateway);

    expect(result.current.vm.status).toBe('loading');
    expect(result.current.vm.isEmpty).toBe(false);
  });

  it('clears every facet at once', async () => {
    vi.mocked(gateway.list).mockResolvedValue([conducao, automovel]);

    const { result } = renderSkills('/skills?name=cond&sourceLevel=1', gateway);
    await waitFor(() => expect(result.current.vm.status).toBe('ready'));

    act(() => result.current.vm.clearFilters());

    expect(result.current.vm.filter).toEqual({ name: '', sourceLevel: null, baseAttribute: null });
    expect(result.current.search).toBe('');
  });

  it('ignores a malformed filter parameter instead of failing', async () => {
    vi.mocked(gateway.list).mockResolvedValue([conducao, automovel]);

    const { result } = renderSkills('/skills?sourceLevel=9&baseAttribute=XYZ', gateway);
    await waitFor(() => expect(result.current.vm.status).toBe('ready'));

    expect(result.current.vm.filter.sourceLevel).toBeNull();
    expect(result.current.vm.filter.baseAttribute).toBeNull();
    expect(result.current.vm.items).toHaveLength(2);
  });

  it('exposes a failure as an error state, and logs and announces it exactly once', async () => {
    vi.mocked(gateway.list).mockRejectedValue(new ApiError(ApiErrorKind.Server, 'boom', 500, null));

    const { result } = renderSkills('/skills', gateway);
    await waitFor(() => expect(result.current.vm.status).toBe('error'));

    expect(result.current.vm.error?.kind).toBe(ApiErrorKind.Server);
    expect(result.current.vm.items).toEqual([]);
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(notify.error).toHaveBeenCalledTimes(1);
  });

  it('re-issues the request on reload', async () => {
    vi.mocked(gateway.list).mockResolvedValue([conducao]);

    const { result } = renderSkills('/skills', gateway);
    await waitFor(() => expect(result.current.vm.status).toBe('ready'));

    act(() => result.current.vm.reload());
    await waitFor(() => expect(gateway.list).toHaveBeenCalledTimes(2));
  });

  it('keeps the filter out of the URL when urlSync is off', async () => {
    vi.mocked(gateway.list).mockResolvedValue([conducao, automovel]);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={['/skills']}>{children}</MemoryRouter>
    );

    const { result } = renderHook(
      () => ({ vm: useSkills({ gateway, urlSync: false }), search: useLocation().search }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.vm.status).toBe('ready'));

    act(() => result.current.vm.setName('cond'));

    expect(result.current.vm.items.map((skill) => skill.name)).toEqual(['Condução']);
    expect(result.current.search).toBe('');
  });
});
