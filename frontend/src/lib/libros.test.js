import { describe, expect, it, vi } from 'vitest'
import { filtrarPorEstado, librosPendientes, validarLibro } from './libros.js'

describe('validarLibro', () => {
  it.each([
    ['sin título', { titulo: '', estado: 'pendiente', calificacion: null }],
    ['con solo espacios', { titulo: '   ', estado: 'pendiente', calificacion: null }],
    ['con título nulo', { titulo: null, estado: 'pendiente', calificacion: null }],
    ['inexistente', undefined],
  ])('rechaza un libro %s', (_caso, libro) => {
    const resultado = validarLibro(libro)
    expect(resultado.valido).toBe(false)
    expect(resultado.error).toBe('El título es obligatorio.')
  })

  it.each([0, 6])('rechaza la calificación %i (fuera de rango)', (calificacion) => {
    const resultado = validarLibro({ titulo: 'Rayuela', estado: 'leido', calificacion })
    expect(resultado.valido).toBe(false)
    expect(resultado.error).toContain('entre 1 y 5')
  })

  it('rechaza calificar un libro que no está leído', () => {
    const resultado = validarLibro({ titulo: 'Rayuela', estado: 'leyendo', calificacion: 4 })
    expect(resultado.valido).toBe(false)
    expect(resultado.error).toContain('leído')
  })

  it('acepta un libro válido', () => {
    const resultado = validarLibro({ titulo: 'Rayuela', estado: 'leido', calificacion: 5 })
    expect(resultado.valido).toBe(true)
    expect(resultado.error).toBeNull()
  })
})

describe('filtrarPorEstado', () => {
  const libros = [
    { id: 1, estado: 'leido' },
    { id: 2, estado: 'pendiente' },
  ]

  it('devuelve todos con el filtro "todos"', () => {
    expect(filtrarPorEstado(libros, 'todos')).toHaveLength(2)
  })

  it('devuelve solo los del estado pedido', () => {
    expect(filtrarPorEstado(libros, 'leido')).toEqual([{ id: 1, estado: 'leido' }])
  })
})

describe('librosPendientes (con mock)', () => {
  it('devuelve solo los pendientes que trae la API', async () => {
    const traer = vi.fn().mockResolvedValue([
      { id: 1, titulo: 'A', estado: 'leido' },
      { id: 2, titulo: 'B', estado: 'pendiente' },
    ])
    const pendientes = await librosPendientes(traer)
    expect(pendientes.map((l) => l.titulo)).toEqual(['B'])
  })

  it('le pide a la API la ruta correcta', async () => {
    const traer = vi.fn().mockResolvedValue([])
    await librosPendientes(traer)
    expect(traer).toHaveBeenCalledWith('/api/libros')
  })
})
