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

test('TC-006: like persists in localStorage', async ({ page }) => {
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
