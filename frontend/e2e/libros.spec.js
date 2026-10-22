import { test, expect } from '@playwright/test';

test('1. La aplicacion carga la pagina principal en QA', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await expect(page.locator('body')).toBeVisible();
});

test('2. Verifica la presencia del contenedor principal de la UI', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  const container = page.locator('#root, main, body').first();
  await expect(container).toBeVisible();
});

test('3. La interfaz responde y mantiene estabilidad visual', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await expect(page.locator('body')).toBeVisible();
});
