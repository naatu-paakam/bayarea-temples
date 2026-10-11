import { test, expect } from '@playwright/test';

test('TC-001: homepage loads with hero, search and temple sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Discover Bay Area Temples' })).toBeVisible();
  await expect(page.getByRole('search')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Featured Temples' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Most Reviewed' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Browse by Deity' })).toBeVisible();
});

test('TC-002: natural-language search navigates to filtered directory', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Search temples in plain words').fill('Sai temples');
  await page.getByRole('search').getByRole('button', { name: 'Search' }).click();
  await expect(page).toHaveURL(/\/temples\?/);
  await expect(page.getByText(/Results for/i)).toBeVisible();
});

test('TC-003: directory filters and sorting work', async ({ page }) => {
  await page.goto('/temples');
  await expect(page.getByText(/14 temples found/)).toBeVisible();
  await page.getByRole('button', { name: 'South Bay', exact: true }).click();
  await expect(page.getByText(/temples found/)).not.toHaveText('14 temples found');
  await page.getByLabel('Sort').selectOption('name');
  const first = page.locator('main h3').first();
  await expect(first).toContainText('Balaji Matha Temple');
});

test('TC-004: deity chip deep-links to filtered directory', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Shiva', exact: true }).click();
  await expect(page).toHaveURL(/deity=Shiva/);
  await expect(page.getByText(/temples found/)).toBeVisible();
});
