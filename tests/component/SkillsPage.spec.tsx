import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import SkillsPage from '@/pages/SkillsPage';
import { useSkills } from '@/hooks/use-skills';
import type { SkillsViewModel } from '@/hooks/use-skills';
import { ApiError, ApiErrorKind } from '@/models/api-error';
import { conducaoDto, esportesDto } from '../helpers/fixtures/skill.fixtures';
import { toSkill } from '@/models/skill.mapper';

/**
 * `SkillsPage` takes no props (it reads `useSkills()` itself), so — like
 * `ApiStatusBadge` (LLD §10.3 intent) — the hook module is mocked to drive it
 * through explicit "props" in isolation, with no real gateway and no request.
 */
vi.mock('@/hooks/use-skills', () => ({ useSkills: vi.fn() }));

const mockedUseSkills = vi.mocked(useSkills);

const conducao = toSkill(conducaoDto);
const esportes = toSkill(esportesDto);

const buildViewModel = (overrides: Partial<SkillsViewModel> = {}): SkillsViewModel => ({
  items: [],
  groups: [],
  total: 0,
  matchCount: 0,
  isEmpty: false,
  isFiltered: false,
  status: 'ready',
  error: null,
  filter: { name: '', sourceLevel: null, baseAttribute: null },
  baseAttributeOptions: [],
  setName: vi.fn(),
  setSourceLevel: vi.fn(),
  setBaseAttribute: vi.fn(),
  clearFilters: vi.fn(),
  reload: vi.fn(),
  ...overrides,
});

function renderPage(viewModel: SkillsViewModel) {
  mockedUseSkills.mockReturnValue(viewModel);
  const router = createMemoryRouter(
    [{ path: '/skills', element: <SkillsPage />, children: [{ path: ':id', element: <div /> }] }],
    { initialEntries: ['/skills'] },
  );
  return render(<RouterProvider router={router} />);
}

describe('SkillsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the skeleton while loading', () => {
    renderPage(buildViewModel({ status: 'loading' }));

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders an error state and retries on demand', () => {
    const reload = vi.fn();
    renderPage(
      buildViewModel({
        status: 'error',
        error: new ApiError(ApiErrorKind.Network, 'The service could not be reached.'),
        reload,
      }),
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders the catalogue and shows the provenance level on every row', () => {
    renderPage(
      buildViewModel({
        groups: [{ skill: conducao, subgroups: [] }],
        total: 1,
        matchCount: 1,
      }),
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Condução')).toBeInTheDocument();
    expect(screen.getByText('L1')).toBeInTheDocument(); // compact SourceLevelBadge
  });

  it('marks a group row as GROUP · NOT PLAYABLE, distinct from a leaf (AC 7)', () => {
    renderPage(
      buildViewModel({
        groups: [{ skill: conducao, subgroups: [] }],
        total: 1,
        matchCount: 1,
      }),
    );

    expect(screen.getByText('Group · not playable')).toBeInTheDocument();
  });

  it('renders more than one group at once, each with its own row', () => {
    renderPage(
      buildViewModel({
        groups: [
          { skill: conducao, subgroups: [] },
          { skill: esportes, subgroups: [] },
        ],
        total: 2,
        matchCount: 2,
      }),
    );

    expect(screen.getByText('Condução')).toBeInTheDocument();
    expect(screen.getByText('Esportes')).toBeInTheDocument();
  });

  it('renders EmptyState with a clear-filters action when a search matches nothing', () => {
    renderPage(buildViewModel({ isEmpty: true, isFiltered: true, total: 246, matchCount: 0 }));

    const emptyState = screen.getByRole('status');
    expect(emptyState).toHaveTextContent('No skill matches this search');
    // Two "Clear filters" buttons legitimately coexist here: FilterBar's escape
    // hatch and EmptyState's own action — assert the one inside EmptyState.
    expect(within(emptyState).getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  });

  it('renders EmptyState with no clear action when the whole catalogue is empty', () => {
    renderPage(buildViewModel({ isEmpty: true, isFiltered: false, total: 0, matchCount: 0 }));

    expect(screen.getByText('No skills available')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });

  it('shows the match count against the total', () => {
    renderPage(
      buildViewModel({ groups: [{ skill: conducao, subgroups: [] }], total: 246, matchCount: 1 }),
    );

    expect(screen.getByText('1 of 246')).toBeInTheDocument();
  });
});
