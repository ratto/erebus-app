import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation, useNavigationType } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFilterState } from './use-filter-state';

/**
 * A deliberately non-Skill filter: `useFilterState` is an entity-agnostic
 * primitive and must be proven as one (LLD §7.6, PLAN step A2).
 */
interface TestFilter {
  name: string;
  level: number | null;
}

const emptyTestFilter: TestFilter = { name: '', level: null };

const parseTestFilter = (params: URLSearchParams): TestFilter => {
  const rawLevel = Number(params.get('level'));
  const level = Number.isInteger(rawLevel) && rawLevel > 0 ? rawLevel : null;

  return { name: params.get('name')?.trim() ?? '', level };
};

const serialiseTestFilter = (filter: TestFilter): URLSearchParams => {
  const params = new URLSearchParams();
  if (filter.name !== '') params.set('name', filter.name);
  if (filter.level !== null) params.set('level', String(filter.level));

  return params;
};

const renderFilterState = (initialPath: string, urlSync = true) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
  );

  return renderHook(
    () => ({
      state: useFilterState<TestFilter>({
        empty: emptyTestFilter,
        parse: parseTestFilter,
        serialise: serialiseTestFilter,
        urlSync,
      }),
      search: useLocation().search,
      navigationType: useNavigationType(),
    }),
    { wrapper },
  );
};

describe('useFilterState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads the initial filter out of the URL', () => {
    const { result } = renderFilterState('/skills?name=cond&level=2');

    expect(result.current.state.filter).toEqual({ name: 'cond', level: 2 });
  });

  it('falls back to the empty filter when no parameter is present', () => {
    const { result } = renderFilterState('/skills');

    expect(result.current.state.filter).toEqual(emptyTestFilter);
  });

  it('ignores a malformed parameter instead of throwing', () => {
    const { result } = renderFilterState('/skills?level=nine');

    expect(result.current.state.filter.level).toBeNull();
  });

  it('drops a malformed parameter from the URL on the next write', () => {
    const { result } = renderFilterState('/skills?level=nine');

    act(() => result.current.state.patch({ name: 'arco' }));

    expect(result.current.search).toBe('?name=arco');
  });

  it('writes a patched value into the URL', () => {
    const { result } = renderFilterState('/skills');

    act(() => result.current.state.patch({ name: 'automóvel' }));

    expect(result.current.search).toBe(`?name=${encodeURIComponent('automóvel')}`);
    expect(result.current.state.filter.name).toBe('automóvel');
  });

  it('merges a patch with the filter already in the URL', () => {
    const { result } = renderFilterState('/skills?name=cond');

    act(() => result.current.state.patch({ level: 3 }));

    expect(result.current.state.filter).toEqual({ name: 'cond', level: 3 });
  });

  it('removes the parameter when a value is patched back to empty', () => {
    const { result } = renderFilterState('/skills?name=cond&level=2');

    act(() => result.current.state.patch({ name: '' }));

    expect(result.current.search).toBe('?level=2');
  });

  it('replaces the history entry rather than pushing one per keystroke', () => {
    const { result } = renderFilterState('/skills');

    act(() => result.current.state.patch({ name: 'a' }));

    expect(result.current.navigationType).toBe('REPLACE');
  });

  it('clears every parameter', () => {
    const { result } = renderFilterState('/skills?name=cond&level=2');

    act(() => result.current.state.clear());

    expect(result.current.search).toBe('');
    expect(result.current.state.filter).toEqual(emptyTestFilter);
  });

  it('keeps the filter in local state and leaves the URL alone when urlSync is false', () => {
    const { result } = renderFilterState('/skills', false);

    act(() => result.current.state.patch({ name: 'cond' }));

    expect(result.current.state.filter.name).toBe('cond');
    expect(result.current.search).toBe('');
  });

  it('clears the local filter when urlSync is false', () => {
    const { result } = renderFilterState('/skills', false);

    act(() => result.current.state.patch({ name: 'cond', level: 2 }));
    act(() => result.current.state.clear());

    expect(result.current.state.filter).toEqual(emptyTestFilter);
  });

  it('ignores the URL entirely when urlSync is false, even if parameters are present', () => {
    const { result } = renderFilterState('/skills?name=cond', false);

    expect(result.current.state.filter).toEqual(emptyTestFilter);
  });
});
