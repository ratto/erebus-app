import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/hooks/use-theme';
import { http } from '@/services/http';
import { ROUTES, router } from '@/routes';
import {
  adagasDto,
  buildArtificeDetailDto,
  buildConducaoDetailDto,
  buildExplosivosDetailDto,
  esquivaDto,
  explosivosDto,
  skillListFixture,
} from '../helpers/fixtures/skill.fixtures';

/**
 * The skills slice assembled behind a stubbed HTTP layer: the real router,
 * `SkillsPage`/`SkillDetailPage`, `useSkills`/`useSkill`, `SkillGateway`, the
 * real mapper and the real filter all run unmodified. Only `@/services/http`
 * — the single Axios instance `SkillGateway`'s production singleton imports
 * — is replaced, mirroring `tests/integration/app-shell.int.spec.tsx` (LLD
 * §10.4; MSW is deliberately not used, §2.3).
 *
 * Every fixture DTO is copied verbatim from a real `GET /v1/skills` /
 * `GET /v1/skills/:id` run against a locally migrated + seeded `erebus-api`
 * (PLAN.md risk R12) — see `tests/helpers/fixtures/skill.fixtures.ts`.
 *
 * `MainLayout` (which every `/skills` route renders under) also mounts
 * `ApiStatusBadge`, whose ambient `useApiHealth` probe calls `GET /health`
 * through this same mocked `http.get`. Every mock in this file is therefore
 * dispatched by URL — never by call order — so the health probe's own,
 * unrelated request can never desynchronise a `mockResolvedValueOnce` /
 * `mockRejectedValueOnce` queue meant for `/skills`.
 */
vi.mock('@/services/http', () => ({ http: { get: vi.fn() } }));

const mockedGet = vi.mocked(http.get);

const HEALTH_OK = { data: { status: 'ok' as const, version: '1.0.0', uptimeMs: 1 } };

/** `GET /skills` calls only — excludes the ambient `/health` probe. */
function skillsListCallCount(): number {
  return mockedGet.mock.calls.filter(([url]) => url === '/skills').length;
}

interface EndpointHandlers {
  list?: () => Promise<unknown>;
  detail?: (id: string) => Promise<unknown>;
}

/** Wires `http.get` by URL: `/health` is always benign, `/skills` and
 * `/skills/:id` are dispatched to the given handlers (defaulting to the full
 * catalogue fixture for the list). */
function mockEndpoints({ list, detail }: EndpointHandlers) {
  mockedGet.mockImplementation((url: string) => {
    if (url === '/health') return Promise.resolve(HEALTH_OK);
    if (url === '/skills') return list ? list() : Promise.resolve({ data: skillListFixture });
    const match = /^\/skills\/(\d+)$/.exec(url);
    if (match && detail) return detail(match[1]!);
    return Promise.reject(new Error(`Unhandled mocked GET ${url} in this test`));
  });
}

function rejectedAxiosError(status: number, detail: string) {
  return Promise.reject(
    Object.assign(new Error(`Request failed with status code ${status}`), {
      isAxiosError: true,
      response: {
        status,
        data: {
          type: `https://erebus.dev/problems/${status === 404 ? 'not-found' : 'server-error'}`,
          title: status === 404 ? 'Resource not found' : 'Internal server error',
          status,
          detail,
          instance: '/v1/skills',
        },
      },
    }),
  );
}

function networkError() {
  return Promise.reject(Object.assign(new Error('Network Error'), { isAxiosError: true }));
}

function renderApp() {
  return render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>,
  );
}

async function navigateTo(path: string) {
  await act(async () => {
    await router.navigate(path);
  });
}

describe('skills — integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. happy path: lists the catalogue with a provenance badge on every row', async () => {
    mockEndpoints({});

    renderApp();
    await navigateTo(ROUTES.skills);

    expect(await screen.findByRole('button', { name: /Open Condução/ })).toBeInTheDocument();
    expect(skillsListCallCount()).toBe(1);
    // `useAsyncResource` always supplies its own AbortSignal (unlike the bare
    // `gateway.list()` call the unit suite exercises), so the request config
    // carries `{ signal }`, not the empty object of a signal-less call.
    const [url, config] = mockedGet.mock.calls.find(([callUrl]) => callUrl === '/skills')!;
    expect(url).toBe('/skills');
    expect(config).toHaveProperty('signal');

    // Every data row is a clickable "Open <name>" control (EntityTable sets
    // role="button" on it) and carries a compact SourceLevelBadge.
    const conducaoRow = screen.getByRole('button', { name: /Open Condução/ });
    expect(within(conducaoRow).getByText('L1')).toBeInTheDocument();
  });

  it('2. search narrows the list and writes ?name= to the URL, with no second request', async () => {
    mockEndpoints({});

    renderApp();
    await navigateTo(ROUTES.skills);
    await screen.findByRole('button', { name: /Open Condução/ });

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search by name' }), 'Explosivos');

    expect(await screen.findByRole('button', { name: /Open Explosivos/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Open Condução/ })).not.toBeInTheDocument();
    expect(router.state.location.search).toContain('name=Explosivos');
    expect(skillsListCallCount()).toBe(1); // filtering happens in memory (PLAN D8)
  });

  it('3. filters by base attribute, matching the effective (inherited) attribute', async () => {
    mockEndpoints({});

    renderApp();
    await navigateTo(ROUTES.skills);
    await screen.findByRole('button', { name: /Open Condução/ });

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Base attribute' }), 'DEX');

    // Adagas (DEX) stays; Condução (AGI) and Explosivos (no attribute) go away.
    expect(await screen.findByRole('button', { name: /Open Adagas/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Open Condução/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Open Explosivos/ })).not.toBeInTheDocument();
  });

  it('4. an empty result renders EmptyState with a working clear-filters action', async () => {
    mockEndpoints({});

    renderApp();
    await navigateTo(ROUTES.skills);
    await screen.findByRole('button', { name: /Open Condução/ });

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Search by name' }),
      'no skill has this name',
    );

    // MainLayout's ambient ApiStatusBadge also carries role="status", so the
    // EmptyState block is found by its own text and then queried from there.
    await screen.findByText('No skill matches this search');
    const emptyState = screen.getByText('No skill matches this search').closest('[role="status"]');
    expect(emptyState).not.toBeNull();

    await userEvent.click(
      within(emptyState as HTMLElement).getByRole('button', { name: 'Clear filters' }),
    );

    expect(await screen.findByRole('button', { name: /Open Condução/ })).toBeInTheDocument();
  });

  it('5. an API failure renders ErrorState, and retry re-issues the request', async () => {
    let attempt = 0;
    mockEndpoints({
      list: () => {
        attempt += 1;
        return attempt === 1 ? networkError() : Promise.resolve({ data: skillListFixture });
      },
    });

    renderApp();
    await navigateTo(ROUTES.skills);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The catalogue service could not be reached',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('button', { name: /Open Condução/ })).toBeInTheDocument();
    expect(skillsListCallCount()).toBe(2);
  });

  it('6. a 404 on a detail route renders the not-found state inside the dialog', async () => {
    // The nested `/skills/:id` route mounts both `SkillsPage` (GET /skills, for
    // the listing behind the dialog) and `SkillDetailPage` (GET /skills/999999,
    // which 404s).
    mockEndpoints({ detail: () => rejectedAxiosError(404, 'Skill with id 999999 was not found.') });

    renderApp();
    await navigateTo(ROUTES.skill(999999));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('alert')).toHaveTextContent('This record no longer exists');
  });

  it('7. a contract-violating payload renders ErrorState, not a half-empty table', async () => {
    mockEndpoints({
      list: () => Promise.resolve({ data: [{ id: 1, name: 'Missing every other field' }] }),
    });

    renderApp();
    await navigateTo(ROUTES.skills);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The catalogue answered in an unexpected shape',
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('8. navigates into a detail and back, the active filter surviving the round trip (§5.3)', async () => {
    mockEndpoints({ detail: () => Promise.resolve({ data: buildConducaoDetailDto() }) });

    renderApp();
    await navigateTo(`${ROUTES.skills}?name=Condu%C3%A7%C3%A3o`);
    await screen.findByRole('button', { name: /Open Condução/ });

    await userEvent.click(screen.getByRole('button', { name: /Open Condução/ }));

    const dialog = await screen.findByRole('dialog', { name: 'Condução' });
    expect(dialog).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(router.state.location.search).toContain('name=Condu');
    expect(screen.getByRole('button', { name: /Open Condução/ })).toBeInTheDocument();
  });

  it('renders the group → subgroup hierarchy with the group visually distinguishable from its leaves (AC 7)', async () => {
    mockEndpoints({});

    renderApp();
    await navigateTo(ROUTES.skills);

    const groupRow = await screen.findByRole('button', { name: /Open Condução/ });
    expect(within(groupRow).getByText('Group · not playable')).toBeInTheDocument();

    const subgroupRow = screen.getByRole('button', { name: /Open Automóvel/ });
    expect(within(subgroupRow).queryByText('Group · not playable')).not.toBeInTheDocument();
  });

  it('renders the Condução N3 category grouping in the detail (AC 6)', async () => {
    mockEndpoints({ detail: () => Promise.resolve({ data: buildConducaoDetailDto() }) });

    renderApp();
    await navigateTo(ROUTES.skill(11));

    const dialog = await screen.findByRole('dialog', { name: 'Condução' });
    expect(within(dialog).getByText('Ordinary driving')).toBeInTheDocument();
    expect(within(dialog).getByText('Specialised piloting')).toBeInTheDocument();
  });

  it('border case: Explosivos renders "No group" / "No base attribute" as content, not an error (AC 8)', async () => {
    mockEndpoints({ detail: () => Promise.resolve({ data: buildExplosivosDetailDto() }) });

    renderApp();
    await navigateTo(ROUTES.skill(explosivosDto.id));

    const dialog = await screen.findByRole('dialog', { name: 'Explosivos' });
    expect(within(dialog).getByText('No group')).toBeInTheDocument();
    expect(within(dialog).getByText('No base attribute')).toBeInTheDocument();
    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument();
  });

  it('border case: Artífice appears in the catalogue and its detail carries the divergence note, without breaking navigation (AC 8)', async () => {
    mockEndpoints({ detail: () => Promise.resolve({ data: buildArtificeDetailDto() }) });

    renderApp();
    await navigateTo(ROUTES.skills);

    const row = await screen.findByRole('button', { name: /Open Artífice/ });
    await userEvent.click(row);

    const dialog = await screen.findByRole('dialog', { name: 'Artífice' });
    expect(
      within(dialog).getByText(/A fonte canônica marca temSubgrupos: true/),
    ).toBeInTheDocument();
  });

  it('a name filter does not leak a leaf across an unrelated group', async () => {
    mockEndpoints({});

    renderApp();
    await navigateTo(ROUTES.skills);
    await screen.findByRole('button', { name: /Open Condução/ });

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search by name' }), adagasDto.name);

    expect(await screen.findByRole('button', { name: /Open Adagas/ })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: new RegExp(`Open ${esquivaDto.name}`) }),
    ).not.toBeInTheDocument();
  });
});
