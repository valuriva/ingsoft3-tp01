// Logica pura del frontend: sin DOM, sin red. Por eso se testea sin mocks de UI.

export function validarLibro(libro) {
  const titulo = (libro?.titulo ?? '').trim()
  if (!titulo) {
    return { valido: false, error: 'El título es obligatorio.' }
  }

  const calificacion = libro.calificacion
  if (calificacion != null) {
    if (calificacion < 1 || calificacion > 5) {
      return { valido: false, error: 'La calificación debe estar entre 1 y 5.' }
    }
    if (libro.estado !== 'leido') {
      return { valido: false, error: 'Solo se puede calificar un libro leído.' }
    }
  }

  return { valido: true, error: null }
}

export function filtrarPorEstado(libros, estado) {
  if (estado === 'todos') {
    return libros
  }
  return libros.filter((l) => l.estado === estado)
}

// El cliente HTTP entra por parametro: en produccion es fetch, en el test es un doble.
export async function librosPendientes(traer) {
  const libros = await traer('/api/libros')
  return libros.filter((l) => l.estado === 'pendiente')
}
