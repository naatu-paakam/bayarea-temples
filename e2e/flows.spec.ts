import { test, expect } from '@playwright/test';

test('TC-009: visit planner add, reorder, clear', async ({ page }) => {
  await page.goto('/temples/shiva-vishnu-temple-livermore');
  await page.getByRole('button', { name: '+ Add to visit plan' }).click();
  await expect(page.getByText('Added to your visit plan')).toBeVisible();
  await page.goto('/plan');
  await expect(page.getByRole('link', { name: 'Shiva-Vishnu Temple' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open route in Google Maps' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear plan' }).click();
  await expect(page.getByText('Your plan is empty')).toBeVisible();
});

test('TC-010: blog list and article render', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.getByRole('heading', { name: 'Temple Knowledge' })).toBeVisible();
  await page.getByRole('link', { name: /Navarathri 2026/ }).click();
  await expect(page.getByRole('heading', { name: 'Navarathri 2026: Bay Area Temple Guide' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Related articles' })).toBeVisible();
});

test('TC-011: festivals page lists Navarathri programs', async ({ page }) => {
  await page.goto('/festivals');
  await expect(page.getByRole('heading', { name: /Navarathri 2026/ })).toBeVisible();
  await expect(page.getByText('Durga Pooja Celebrations')).toBeVisible();
});

test('TC-012: deities page counts link to directory', async ({ page }) => {
  await page.goto('/deities');
  await page.getByRole('link', { name: /Sai Baba/ }).click();
  await expect(page).toHaveURL(/deity=Sai%20Baba/);
});
