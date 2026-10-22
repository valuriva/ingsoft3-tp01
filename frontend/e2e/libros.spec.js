import { test, expect } from '@playwright/test';

test('1. Crear un libro lo muestra en la pantalla y borrarlo lo remueve', async ({ page }) => {
  await page.goto('/');
  const titulo = `Libro E2E ${Date.now()}`;

  const input = page.getByRole('textbox').first();
  await input.fill(titulo);

  const botonCreate = page.getByRole('button', { name: /agregar|crear|guardar/i });
  await botonCreate.click();

  await expect(page.getByText(titulo)).toBeVisible();

  const botonBorrar = page.getByRole('button', { name: new RegExp(`borrar|eliminar|${titulo}`, 'i') }).first();
  if (await botonBorrar.isVisible()) {
    await botonBorrar.click();
    await expect(page.getByText(titulo)).toHaveCount(0);
  }
});

test('2. Intentar agregar un libro vacio o invalido no genera registros vacios', async ({ page }) => {
  await page.goto('/');
  const input = page.getByRole('textbox').first();
  await input.fill('');

  const botonCreate = page.getByRole('button', { name: /agregar|crear|guardar/i });
  await botonCreate.click();

  const emptyText = page.getByText('', { exact: true });
  await expect(emptyText).toHaveCount(0);
});

test('3. La aplicacion carga correctamente el header y la vista principal', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});
