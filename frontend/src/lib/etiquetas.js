// Segundo codigo NUEVO sin tests (para el PR que queda abierto y en rojo).

export function etiquetaDeCalificacion(calificacion) {
  if (calificacion == null) {
    return 'sin calificar'
  }
  if (calificacion <= 1) {
    return 'malo'
  }
  if (calificacion === 2) {
    return 'flojo'
  }
  if (calificacion === 3) {
    return 'normal'
  }
  if (calificacion === 4) {
    return 'bueno'
  }
  return 'excelente'
}

export function resumenDeLibro(libro) {
  const etiqueta = etiquetaDeCalificacion(libro.calificacion)
  if (libro.estado === 'leido') {
    return `${libro.titulo}: leído (${etiqueta})`
  }
  if (libro.estado === 'leyendo') {
    return `${libro.titulo}: en lectura`
  }
  if (libro.estado === 'pendiente') {
    return `${libro.titulo}: pendiente`
  }
  return `${libro.titulo}: estado desconocido`
}
