import { test, expect } from '@playwright/test';

test('TC-001: homepage loads with hero, search bar and temple sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Discover Bay Area Temples' })).toBeVisible();
  await expect(page.getByRole('search')).toBeVisible();
  // Ask button replaces Search
  await expect(page.getByRole('button', { name: 'Ask' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Most Reviewed' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Browse by Deity' })).toBeVisible();
});

test('TC-002: Ask button navigates to filtered directory (keyword fallback when no function)', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Ask about Bay Area temples').fill('Sai temples');
  await page.getByRole('search').getByRole('button', { name: 'Ask' }).click();
  await expect(page).toHaveURL(/\/temples\?/);
});

test('TC-003: directory filters and sorting work', async ({ page }) => {
  await page.goto('/temples');
  const countText = page.getByText(/temple.*found/);
  await expect(countText).toBeVisible();
  await page.getByRole('button', { name: 'South Bay', exact: true }).click();
  const southBayCount = await countText.textContent();
  expect(southBayCount).not.toContain('14 temple');
  await page.getByLabel('Sort').selectOption('name');
  const first = page.locator('main h3').first();
  await expect(first).toBeVisible();
});

test('TC-004: deity chip deep-links to filtered directory', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Shiva', exact: true }).click();
  await expect(page).toHaveURL(/deity=Shiva/);
  await expect(page.getByText(/temple.*found/)).toBeVisible();
});

test('TC-014a: Temples nav link', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'Temples', exact: true }).click();
  await expect(page).toHaveURL('/temples');
  await expect(page.getByText(/temple.*found/)).toBeVisible();
});

test('TC-014b: Deities nav link', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'Deities', exact: true }).click();
  await expect(page).toHaveURL('/deities');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('TC-014c: Festivals nav link', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'Festivals', exact: true }).click();
  await expect(page).toHaveURL('/festivals');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('TC-014d: Blog nav link', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'Blog', exact: true }).click();
  await expect(page).toHaveURL('/blog');
  await expect(page.getByRole('heading', { name: /Temple Knowledge/i })).toBeVisible();
});

test('TC-014e: My Visit nav link', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'My Visit', exact: true }).click();
  await expect(page).toHaveURL('/plan');
});

test('TC-014f: About nav link', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'About', exact: true }).click();
  await expect(page).toHaveURL('/about');
  await expect(page.getByRole('heading', { name: /About/i })).toBeVisible();
});

test('TC-015: logo / home link returns to homepage from inner page', async ({ page }) => {
  await page.goto('/temples');
  await page.getByRole('link', { name: 'Bay Area Temples' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'Discover Bay Area Temples' })).toBeVisible();
});

test('TC-016: asking from home about a deity navigates to filtered results', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Ask about Bay Area temples').fill('Ganesha temples');
  await page.getByRole('search').getByRole('button', { name: 'Ask' }).click();
  await expect(page).toHaveURL(/\/temples\?/);
  await expect(page.getByText(/temple.*found/)).toBeVisible();
});
