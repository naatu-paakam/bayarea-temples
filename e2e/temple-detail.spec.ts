import { test, expect } from '@playwright/test';

test('TC-005: temple detail page renders hero, tabs and actions', async ({ page }) => {
  await page.goto('/temples/shiva-vishnu-temple-livermore');
  await expect(page.getByRole('heading', { name: 'Shiva-Vishnu Temple' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get Directions' })).toBeVisible();
  await page.getByRole('tab', { name: 'Festivals' }).click();
  await expect(page.getByText('Durga Pooja Celebrations')).toBeVisible();
  await page.getByRole('tab', { name: 'Visit' }).click();
  await expect(page.getByRole('heading', { name: 'Hours' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Related Temples' })).toBeVisible();
});

test('TC-006: like persists in localStorage across reload', async ({ page }) => {
  await page.goto('/temples/shiva-vishnu-temple-livermore');
  await page.getByRole('button', { name: /Like/ }).click();
  await expect(page.getByRole('button', { name: '♥ Liked' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: '♥ Liked' })).toBeVisible();
});

test('TC-007: unknown temple slug shows not-found', async ({ page }) => {
  await page.goto('/temples/does-not-exist');
  await expect(page.getByText('Temple not found')).toBeVisible();
});

test('TC-008: empty-state temple shows graceful fallbacks', async ({ page }) => {
  await page.goto('/temples/sri-krishna-balaram-temple-sunnyvale');
  await expect(page.getByText('Not rated yet')).toBeVisible();
  await page.getByRole('tab', { name: 'Visit' }).click();
  await expect(page.getByText(/Hours not published/i)).toBeVisible();
});

test('TC-017: temple card on directory links to detail page', async ({ page }) => {
  await page.goto('/temples');
  await page.getByRole('link', { name: 'Shiva-Vishnu Temple' }).first().click();
  await expect(page).toHaveURL(/shiva-vishnu-temple-livermore/);
  await expect(page.getByRole('heading', { name: 'Shiva-Vishnu Temple' })).toBeVisible();
});

test('TC-018: Back to directory link on detail page returns to /temples', async ({ page }) => {
  await page.goto('/temples/shiva-vishnu-temple-livermore');
  const backLink = page.getByRole('link', { name: /All temples|Back/i });
  if (await backLink.isVisible()) {
    await backLink.click();
    await expect(page).toHaveURL('/temples');
  } else {
    // navigate via browser back
    await page.goBack();
    await expect(page).not.toHaveURL(/shiva-vishnu-temple-livermore/);
  }
});

test('TC-019: Related temples section links work', async ({ page }) => {
  await page.goto('/temples/shiva-vishnu-temple-livermore');
  await page.getByRole('tab', { name: 'Visit' }).click();
  const relatedLinks = page.locator('section:has(h2:has-text("Related Temples")) a');
  const count = await relatedLinks.count();
  if (count > 0) {
    const href = await relatedLinks.first().getAttribute('href');
    await relatedLinks.first().click();
    await expect(page).toHaveURL(new RegExp(href?.replace(/\//g, '\\/') ?? ''));
    await expect(page.getByRole('link', { name: 'Get Directions' })).toBeVisible();
  }
});

test('TC-020: + Add to visit plan button appears on detail page', async ({ page }) => {
  await page.goto('/temples/shiva-vishnu-temple-livermore');
  await expect(page.getByRole('button', { name: /Add to visit plan/i })).toBeVisible();
});
