import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import SkillDetailPage from '@/pages/SkillDetailPage';
import { useSkill } from '@/hooks/use-skill';
import type { SkillViewModel } from '@/hooks/use-skill';
import { ApiError, ApiErrorKind } from '@/models/api-error';
import { groupSubgroupsByCategory } from '@/models/skill.filter';
import { toSkillDetail } from '@/models/skill.mapper';
import {
  artificeDto,
  buildArtificeDetailDto,
  buildConducaoDetailDto,
  buildExplosivosDetailDto,
  explosivosDto,
} from '../helpers/fixtures/skill.fixtures';

/**
 * Like `SkillsPage`, `SkillDetailPage` takes no props and reads `useSkill()`
 * itself — the hook module is the isolation seam (LLD §10.3 intent).
 */
vi.mock('@/hooks/use-skill', () => ({ useSkill: vi.fn() }));

const mockedUseSkill = vi.mocked(useSkill);

const buildViewModel = (overrides: Partial<SkillViewModel> = {}): SkillViewModel => ({
  item: null,
  subgroupsByCategory: [],
  status: 'ready',
  error: null,
  notFound: false,
  reload: vi.fn(),
  ...overrides,
});

function renderPage(viewModel: SkillViewModel, id = 11) {
  mockedUseSkill.mockReturnValue(viewModel);
  const router = createMemoryRouter(
    [
      {
        path: '/skills',
        element: (
          <div>
            Skills listing
            <Outlet />
          </div>
        ),
        children: [{ path: ':id', element: <SkillDetailPage /> }],
      },
    ],
    { initialEntries: [`/skills/${id}`] },
  );
  return render(<RouterProvider router={router} />);
}

describe('SkillDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the skeleton while loading', () => {
    renderPage(buildViewModel({ status: 'loading' }));

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('renders an error state on failure', () => {
    renderPage(
      buildViewModel({
        status: 'error',
        error: new ApiError(ApiErrorKind.Server, 'boom'),
      }),
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders the Condução N3 category grouping under English labels (AC 6)', () => {
    const detail = toSkillDetail(buildConducaoDetailDto());

    renderPage(
      buildViewModel({
        item: detail,
        subgroupsByCategory: groupSubgroupsByCategory(detail.subgroups),
      }),
    );

    expect(screen.getByRole('dialog', { name: 'Condução' })).toBeInTheDocument();
    expect(screen.getByText('Ordinary driving')).toBeInTheDocument();
    expect(screen.getByText('Specialised piloting')).toBeInTheDocument();
    expect(screen.getByText('Automóvel')).toBeInTheDocument();
    expect(screen.getByText('Asa Delta')).toBeInTheDocument();
  });

  it('renders a full ProvenanceBlock for the detail', () => {
    const detail = toSkillDetail(buildConducaoDetailDto());
    renderPage(buildViewModel({ item: detail, subgroupsByCategory: [] }));

    expect(screen.getByRole('region', { name: 'Provenance' })).toBeInTheDocument();
    expect(screen.getByText('L1 · CANONICAL')).toBeInTheDocument();
  });

  it('renders "No group" and "No base attribute" as content for Explosivos, not as an error (AC 8)', () => {
    const detail = toSkillDetail(buildExplosivosDetailDto());
    renderPage(buildViewModel({ item: detail, subgroupsByCategory: [] }), explosivosDto.id);

    expect(screen.getByText('No group')).toBeInTheDocument();
    expect(screen.getByText('No base attribute')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it("renders Artífice's divergence note as a footnote, still as a leaf (AC 8)", () => {
    const detail = toSkillDetail(buildArtificeDetailDto());
    renderPage(buildViewModel({ item: detail, subgroupsByCategory: [] }), artificeDto.id);

    expect(screen.getByText(/A fonte canônica marca temSubgrupos: true/)).toBeInTheDocument();
    // A leaf with no catalogued subgroups renders no "group, not purchasable"
    // notice and no Subgroups section.
    expect(
      screen.queryByText(
        'This is a skill group: it is bought through one of its subgroups, never on its own.',
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Subgroups')).not.toBeInTheDocument();
  });
});
