import { expect, test } from '@playwright/test';

/**
 * One smoke spec (PLAN D12): the app boots against a built preview, Home
 * renders, and the theme choice survives a reload — plus one border case
 * (a deep link to an unknown path). This is Infra, not a use case, so the
 * suite is deliberately kept to this single spec (LLD §14 item 18, §10.5).
 *
 * `erebus-api` is not running in this environment (no CORS yet — ADR-003,
 * LLD §15 item 8), and the built preview does not proxy `/v1` (only the Vite
 * dev server does). `ApiStatusBadge` is therefore expected, correctly, to
 * settle in its `error` state — this spec asserts the app degrades
 * gracefully, never that the badge turns green.
 */
test.describe('smoke — app boot, Home, theme persistence', () => {
  test('boots, renders Home, degrades gracefully with no live API, and persists the theme across a reload', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Erebus' })).toBeVisible();

    // Non-blocking failure: the ambient probe reports unreachable, the page
    // around it stays fully usable (ADR-003 §2.4 — no toast for this state).
    const badge = page.getByRole('status');
    await expect(badge).toHaveText(/API unreachable|API timed out|Unexpected API response/);
    await expect(page.getByRole('link', { name: 'About this project' })).toBeVisible();

    const toggle = page.getByRole('button', { name: /Switch to (dark|light) theme/ });
    await expect(toggle).toBeVisible();
    const targetBefore = (await toggle.getAttribute('aria-label')) ?? (await toggle.textContent());
    const goingDark = targetBefore?.includes('dark') ?? false;

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', goingDark ? 'dark' : 'light');

    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('data-theme', goingDark ? 'dark' : 'light');
    await expect(
      page.getByRole('button', {
        name: goingDark ? 'Switch to light theme' : 'Switch to dark theme',
      }),
    ).toBeVisible();
  });

  test('border case: a deep link to an unknown path renders the 404 page and links back home', async ({
    page,
  }) => {
    await page.goto('/this-route-does-not-exist');

    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();

    await page.getByRole('link', { name: 'Back to the home page' }).click();

    await expect(page.getByRole('heading', { name: 'Erebus' })).toBeVisible();
  });
});
