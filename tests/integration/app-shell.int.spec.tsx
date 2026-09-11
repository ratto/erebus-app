import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/hooks/use-theme';
import { http } from '@/services/http';
import { notify } from '@/services/notification';
import { ROUTES, router } from '@/routes';

/**
 * `erebus-app` wires its single route table with `createBrowserRouter`
 * (`src/routes.tsx`), not a route-config array a test can hand to
 * `createMemoryRouter`. The real `router` singleton is therefore rendered
 * directly and driven with its own imperative `navigate()` — the closest
 * real-router equivalent available for this app's shape, still satisfying
 * LLD §10.4 ("the page rendered inside a router with the real hook ... only
 * the AxiosInstance replaced").
 *
 * `@/services/http` — the single Axios instance the real `HealthGateway`
 * singleton imports — is the only thing replaced. The real `useApiHealth`
 * hook and the real `HealthGateway` class run unmodified (§10.4). MSW is
 * deliberately not used (§2.3).
 */
vi.mock('@/services/http', () => ({ http: { get: vi.fn() } }));

const mockedGet = vi.mocked(http.get);

function renderShell() {
  return render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>,
  );
}

const okPayload = { status: 'ok' as const, version: '1.0.0', uptimeMs: 41_293 };

describe('app shell — routing, layouts and the API-health probe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGet.mockResolvedValue({ data: okPayload });
  });

  it('renders HomePage inside LandingLayout at "/", without the MainLayout nav', async () => {
    await act(async () => {
      await router.navigate(ROUTES.home);
    });
    renderShell();

    expect(await screen.findByRole('heading', { name: 'Erebus' })).toBeInTheDocument();
    // LandingLayout renders no <nav>: the Home/About links only exist in MainLayout.
    expect(screen.queryByRole('link', { name: 'About' })).not.toBeInTheDocument();
  });

  it('renders AboutPage inside MainLayout at "/about", with the Home/About nav', async () => {
    renderShell();
    await act(async () => {
      await router.navigate(ROUTES.about);
    });

    expect(await screen.findByRole('heading', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
  });

  it('renders NotFoundPage inside MainLayout for an unknown path', async () => {
    renderShell();
    await act(async () => {
      await router.navigate('/this-route-does-not-exist');
    });

    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to the home page' })).toBeInTheDocument();
  });

  it('mounts ApiStatusBadge in both LandingLayout and MainLayout', async () => {
    renderShell();

    await act(async () => {
      await router.navigate(ROUTES.home);
    });
    expect(await screen.findByRole('status')).toHaveTextContent(/API online/);

    await act(async () => {
      await router.navigate(ROUTES.about);
    });
    expect(await screen.findByRole('status')).toHaveTextContent(/API online/);
  });

  it('degrades gracefully with no toast when erebus-api is unreachable (D7 exemption)', async () => {
    mockedGet.mockRejectedValue(Object.assign(new Error('Network Error'), { isAxiosError: true }));
    const notifyErrorSpy = vi.spyOn(notify, 'error');
    const notifyInfoSpy = vi.spyOn(notify, 'info');

    renderShell();
    await act(async () => {
      await router.navigate(ROUTES.about);
    });

    // Non-blocking failure: the layout (and its heading) still renders fully.
    expect(await screen.findByRole('heading', { name: 'About' })).toBeInTheDocument();
    expect(await screen.findByRole('status')).toHaveTextContent('API unreachable');
    // The health slice is exempt from the one-toast rule (LLD §12.3, ADR-003 §2.4).
    expect(notifyErrorSpy).not.toHaveBeenCalled();
    expect(notifyInfoSpy).not.toHaveBeenCalled();
  });

  it('renders a contract violation as the non-blocking error state, not a crash', async () => {
    mockedGet.mockResolvedValue({ data: { status: 'unknown', version: '1.0.0', uptimeMs: 1 } });

    renderShell();
    await act(async () => {
      await router.navigate(ROUTES.home);
    });

    expect(await screen.findByRole('heading', { name: 'Erebus' })).toBeInTheDocument();
    expect(await screen.findByRole('status')).toHaveTextContent('Unexpected API response');
  });
});
