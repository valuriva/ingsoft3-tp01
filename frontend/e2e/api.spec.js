import { test, expect } from '@playwright/test';

const API = process.env.API_BASE_URL || 'https://miapp-api-qa-eduo.onrender.com';

async function listar(request) {
  const r = await request.get(`${API}/api/libros`);
  expect(r.status()).toBe(200);
  return await r.json();
}

test('1. Crear un libro guarda en la base de QA y borrarlo lo elimina', async ({ request }) => {
  const titulo = `Libro API Test ${Date.now()}`;
  const alta = await request.post(`${API}/api/libros`, { data: { titulo } });
  expect([200, 201]).toContain(alta.status());
  const creado = await alta.json();

  const lista = await listar(request);
  expect(lista.some(l => l.titulo === titulo || l.id === creado.id)).toBe(true);

  if (creado.id) {
    const borrado = await request.delete(`${API}/api/libros/${creado.id}`);
    expect([200, 204]).toContain(borrado.status());

    const despues = await listar(request);
    expect(despues.some(l => l.id === creado.id)).toBe(false);
  }
});

test('2. Un libro con titulo vacio devuelve error 400 y no crea nada', async ({ request }) => {
  const antes = await listar(request);
  const alta = await request.post(`${API}/api/libros`, { data: { titulo: '' } });
  expect([400, 422]).toContain(alta.status());

  const despues = await listar(request);
  expect(despues.length).toBe(antes.length);
});

test('3. Consultar la lista de libros responde con HTTP 200 y formato array', async ({ request }) => {
  const lista = await listar(request);
  expect(Array.isArray(lista)).toBe(true);
});
