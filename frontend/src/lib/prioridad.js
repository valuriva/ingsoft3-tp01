// Codigo NUEVO sin tests (a proposito): compila perfecto y baja la cobertura.

/**
 * Prioridad de lectura de un libro segun cuantos dias hace que se agrego.
 */
export function prioridadDe(libro, ahora = new Date()) {
  if (!libro || !libro.agregadoEl) {
    return 'sin-fecha'
  }
  const dias = (ahora - new Date(libro.agregadoEl)) / 86400000
  if (dias < 1) {
    return 'nuevo'
  }
  if (dias < 7) {
    return 'esta-semana'
  }
  if (dias < 30) {
    return 'este-mes'
  }
  return 'viejo'
}
