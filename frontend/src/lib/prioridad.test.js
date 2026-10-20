import { describe, expect, it } from 'vitest'
import { prioridadDe } from './prioridad.js'

describe('prioridadDe', () => {
  const ahora = new Date('2026-07-01T12:00:00Z')

  it('devuelve sin-fecha si el libro no tiene fecha', () => {
    expect(prioridadDe({}, ahora)).toBe('sin-fecha')
  })

  it('devuelve nuevo dentro del primer día', () => {
    expect(prioridadDe({ agregadoEl: '2026-07-01T06:00:00Z' }, ahora)).toBe('nuevo')
  })

  it('devuelve esta-semana antes de los siete días', () => {
    expect(prioridadDe({ agregadoEl: '2026-06-28T12:00:00Z' }, ahora)).toBe('esta-semana')
  })

  it('devuelve este-mes antes de los treinta días', () => {
    expect(prioridadDe({ agregadoEl: '2026-06-15T12:00:00Z' }, ahora)).toBe('este-mes')
  })

  it('devuelve viejo pasados los treinta días', () => {
    expect(prioridadDe({ agregadoEl: '2026-05-01T12:00:00Z' }, ahora)).toBe('viejo')
  })
})
