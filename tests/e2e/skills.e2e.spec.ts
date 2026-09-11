import { expect, test } from '@playwright/test';

/**
 * One test per US-03 use case (SPEC.md's Use Case Diagram — "Browse Skills
 * List", "Navigate Group → Subgroup Hierarchy", "View Skill Detail" — all
 * `«include»`ing "Query Skills Catalog"), plus two border cases (LLD §10.5).
 * Not more: component and integration tests already cover every other
 * branch (§10.3, §10.4).
 *
 * Runs under the dedicated `chromium-skills` Playwright project
 * (`playwright.config.ts`), whose own `baseURL` points at this app's second
 * preview build, backed by `tests/e2e/helpers/skills-api-stub.mjs` rather
 * than the smoke project's unreachable API — see `playwright.config.ts` for
 * why (CORS gap, `chore/erebus-api-cors`).
 */
test.describe('US-03 — Consultar Perícias', () => {
  test('use case: browse the skills list, search by name and filter by base attribute', async ({
    page,
  }) => {
    await page.goto('/skills');

    await expect(page.getByRole('heading', { name: 'Skills' })).toBeVisible();
    const conducaoRow = page.getByRole('button', { name: /Open Condução/ });
    await expect(conducaoRow).toBeVisible();
    // Every row carries its source level, visible without opening anything.
    await expect(conducaoRow.getByText('L1')).toBeVisible();

    await page.getByRole('searchbox', { name: 'Search by name' }).fill('Explosivos');
    await expect(page.getByRole('button', { name: /Open Explosivos/ })).toBeVisible();
    await expect(conducaoRow).not.toBeVisible();
    await expect(page).toHaveURL(/name=Explosivos/);

    await page.getByRole('button', { name: 'Clear filters' }).first().click();
    await expect(page.getByRole('searchbox', { name: 'Search by name' })).toHaveValue('');

    await page.getByRole('combobox', { name: 'Base attribute' }).selectOption('DEX');
    await expect(page.getByRole('button', { name: /Open Adagas/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Open Condução/ })).not.toBeVisible();
  });

  test('use case: navigate from a skill group into the subgroups it governs', async ({ page }) => {
    await page.goto('/skills');

    const groupRow = page.getByRole('button', { name: /Open Condução/ });
    await expect(groupRow).toBeVisible();
    // Group rows are marked as non-purchasable navigation nodes (AC 7).
    await expect(groupRow.getByText('Group · not playable')).toBeVisible();

    // Its subgroups render indented beneath it in the same listing, already
    // visible without any click — this is what "navigating the hierarchy"
    // means for a flat, always-loaded catalogue (PLAN D8).
    const subgroupRow = page.getByRole('button', { name: /Open Automóvel/ });
    await expect(subgroupRow).toBeVisible();
    await expect(subgroupRow.getByText('Group · not playable')).not.toBeVisible();

    await subgroupRow.click();
    const dialog = page.getByRole('dialog', { name: 'Automóvel' });
    await expect(dialog).toBeVisible();
    // Its own group, named in the "Group" field of the detail.
    await expect(dialog.getByRole('definition').filter({ hasText: 'Condução' })).toBeVisible();
  });

  test('use case: open a skill detail and read its attribute and description, deep-linked', async ({
    page,
  }) => {
    // Deep-linking straight to a detail URL, the border case of §10.5's list.
    await page.goto('/skills/11');

    const dialog = page.getByRole('dialog', { name: 'Condução' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('AGI')).toBeVisible();
    await expect(
      dialog.getByText('Group skill for operating vehicles', { exact: false }),
    ).toBeVisible();
    // The N3 classification surfaces here and only here (AC 6), as a heading
    // above each category's subgroup list.
    await expect(dialog.getByRole('heading', { name: 'Ordinary driving' })).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'Specialised piloting' })).toBeVisible();
    // A full ProvenanceBlock is mandatory on every detail (LLD §14 item 7).
    await expect(dialog.getByRole('region', { name: 'Provenance' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(page).toHaveURL('/skills');
  });

  test('border case: Artífice appears as a leaf with no catalogued subgroups, without breaking navigation', async ({
    page,
  }) => {
    await page.goto('/skills');

    const row = page.getByRole('button', { name: /Open Artífice/ });
    await expect(row).toBeVisible();
    await expect(row.getByText('Group · not playable')).not.toBeVisible();

    await row.click();

    const dialog = page.getByRole('dialog', { name: 'Artífice' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/A fonte canônica marca temSubgrupos: true/)).toBeVisible();
  });

  test('border case: Explosivos renders "No group" / "No base attribute" as content, not an error', async ({
    page,
  }) => {
    await page.goto('/skills');

    await page.getByRole('button', { name: /Open Explosivos/ }).click();

    const dialog = page.getByRole('dialog', { name: 'Explosivos' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('No group')).toBeVisible();
    await expect(dialog.getByText('No base attribute')).toBeVisible();
    await expect(dialog.getByRole('alert')).toHaveCount(0);
  });
});
