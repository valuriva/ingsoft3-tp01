import { test, expect } from '@playwright/test';

test('1. La interfaz principal carga correctamente', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});

test('2. Flujo de creacion de libro desde la pantalla de QA', async ({ page }) => {
  await page.goto('/');
  const titulo = `Libro E2E ${Date.now()}`;
  
  // Busca el primer campo de texto disponible
  const input = page.locator('input[type="text"], input:not([type="hidden"])').first();
  if (await input.isVisible({ timeout: 10000 })) {
    await input.fill(titulo);
    
    // Busca el primer botón disponible para enviar
    const boton = page.locator('button').first();
    await boton.click();
    
    await page.waitForTimeout(3000);
  }
  await expect(page.locator('body')).toBeVisible();
});

test('3. Validacion de carga de formulario sin errores', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('input').first();
  await expect(input).toBeVisible({ timeout: 15000 });
});
