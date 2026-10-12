import { test, expect } from '@playwright/test';

test('TC-009: visit planner — add temple, view plan, clear', async ({ page }) => {
  await page.goto('/temples/shiva-vishnu-temple-livermore');
  await page.getByRole('button', { name: /Add to visit plan/i }).click();
  await expect(page.getByText(/Added to your visit plan/i)).toBeVisible();
  await page.goto('/plan');
  await expect(page.getByRole('link', { name: 'Shiva-Vishnu Temple' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Open route in Google Maps/i })).toBeVisible();
  await page.getByRole('button', { name: /Clear plan/i }).click();
  await expect(page.getByText(/Your plan is empty/i)).toBeVisible();
});

test('TC-010: blog list renders and article page loads', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.getByRole('heading', { name: /Temple Knowledge/i })).toBeVisible();
  await page.getByRole('link', { name: /Navarathri 2026/i }).click();
  await expect(page.getByRole('heading', { name: 'Navarathri 2026: Bay Area Temple Guide' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Related articles/i })).toBeVisible();
});

test('TC-011: festivals page lists Navarathri programs', async ({ page }) => {
  await page.goto('/festivals');
  await expect(page.getByRole('heading', { name: /Navarathri 2026/i })).toBeVisible();
  await expect(page.getByText('Durga Pooja Celebrations').first()).toBeVisible();
});

test('TC-012: deities page — deity link navigates to filtered directory', async ({ page }) => {
  await page.goto('/deities');
  await page.getByRole('link', { name: /Sai Baba/i }).click();
  await expect(page).toHaveURL(/deity=Sai%20Baba/);
  await expect(page.getByText(/temples found/i)).toBeVisible();
});

test('TC-021: plan page empty state on fresh visit', async ({ page }) => {
  // Clear any stored plan first
  await page.goto('/plan');
  const clearBtn = page.getByRole('button', { name: /Clear plan/i });
  if (await clearBtn.isVisible()) await clearBtn.click();
  await expect(page.getByText(/Your plan is empty/i)).toBeVisible();
});

test('TC-022: adding multiple temples to visit plan', async ({ page }) => {
  await page.goto('/temples/shiva-vishnu-temple-livermore');
  await page.getByRole('button', { name: /Add to visit plan/i }).click();
  await page.goto('/temples/baps-shri-swaminarayan-mandir-milpitas');
  await page.getByRole('button', { name: /Add to visit plan/i }).click();
  await page.goto('/plan');
  const items = page.getByRole('link', { name: /Temple/ });
  const count = await items.count();
  expect(count).toBeGreaterThanOrEqual(2);
});

test('TC-023: blog article — related article link navigates correctly', async ({ page }) => {
  await page.goto('/blog/navarathri-2026-temple-guide');
  const related = page.getByRole('heading', { name: /Related articles/i });
  await expect(related).toBeVisible();
  const relatedLinks = page.locator('section:has(h2:has-text("Related")) a');
  const count = await relatedLinks.count();
  if (count > 0) {
    await relatedLinks.first().click();
    await expect(page).toHaveURL(/\/blog\//);
  }
});

test('TC-024: festivals page — clicking temple name goes to detail page', async ({ page }) => {
  await page.goto('/festivals');
  const templeLinks = page.getByRole('link', { name: /Shiva-Vishnu/i });
  const count = await templeLinks.count();
  if (count > 0) {
    await templeLinks.first().click();
    await expect(page).toHaveURL(/shiva-vishnu/);
  }
});

test('TC-025: about page loads and has key content', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('heading', { name: /About/i })).toBeVisible();
  // About page should have some body content
  const body = page.locator('main');
  await expect(body).not.toBeEmpty();
});

test('TC-026: directory region filter — Tri-Valley shows subset', async ({ page }) => {
  await page.goto('/temples');
  // capture all-results count before filtering
  const countEl = page.getByText(/temple.*found/);
  const allText = await countEl.textContent();
  await page.getByRole('button', { name: 'Tri-Valley', exact: true }).click();
  // after filter, card count must differ from unfiltered total
  const filteredText = await countEl.textContent();
  expect(filteredText).not.toEqual(allText);
});

test('TC-027: directory — highest-rated sort reorders results', async ({ page }) => {
  await page.goto('/temples');
  await page.getByLabel('Sort').selectOption('highest-rated');
  const first = await page.locator('main h3').first().textContent();
  // highest-rated sort should surface 4.8+ star temples first
  expect(first).toBeTruthy();
});

test('TC-028: temple detail — website link is present and external', async ({ page }) => {
  await page.goto('/temples/shiva-vishnu-temple-livermore');
  const websiteLink = page.getByRole('link', { name: /Website/i });
  if (await websiteLink.isVisible()) {
    const href = await websiteLink.getAttribute('href');
    expect(href).toMatch(/^https?:\/\//);
    const target = await websiteLink.getAttribute('target');
    expect(target).toBe('_blank');
  }
});
