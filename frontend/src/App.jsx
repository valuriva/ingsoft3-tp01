import { useEffect, useState } from 'react'

const vacio = { titulo: '', autor: '', genero: '', estado: 'pendiente', calificacion: '' }

export default function App() {
  const [libros, setLibros] = useState([])
  const [form, setForm] = useState(vacio)
  const [editandoId, setEditandoId] = useState(null)
  const [filtro, setFiltro] = useState('todos')

  const cargar = async () => {
    const res = await fetch('/api/libros')
    setLibros(await res.json())
  }

  useEffect(() => { cargar() }, [])

  const guardar = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      calificacion: form.calificacion ? Number(form.calificacion) : null,
    }
    const url = editandoId ? `/api/libros/${editandoId}` : '/api/libros'
    const method = editandoId ? 'PUT' : 'POST'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setForm(vacio)
    setEditandoId(null)
    cargar()
  }

  const editar = (libro) => {
    setForm({
      titulo: libro.titulo,
      autor: libro.autor,
      genero: libro.genero,
      estado: libro.estado,
      calificacion: libro.calificacion ?? '',
    })
    setEditandoId(libro.id)
  }

  const borrar = async (id) => {
    await fetch(`/api/libros/${id}`, { method: 'DELETE' })
    cargar()
  }

  const librosFiltrados = filtro === 'todos'
    ? libros
    : libros.filter(l => l.estado === filtro)

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>📚 Mi Biblioteca</h1>

      <form onSubmit={guardar} style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
        <input placeholder="Título" required value={form.titulo}
          onChange={e => setForm({ ...form, titulo: e.target.value })} />
        <input placeholder="Autor" required value={form.autor}
          onChange={e => setForm({ ...form, autor: e.target.value })} />
        <input placeholder="Género" value={form.genero}
          onChange={e => setForm({ ...form, genero: e.target.value })} />
        <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
          <option value="pendiente">Pendiente</option>
          <option value="leyendo">Leyendo</option>
          <option value="leido">Leído</option>
        </select>
        <input type="number" min="1" max="5" placeholder="Calificación (1-5)"
          value={form.calificacion}
          onChange={e => setForm({ ...form, calificacion: e.target.value })} />
        <button type="submit">{editandoId ? 'Guardar cambios' : 'Agregar libro'}</button>
      </form>

      <div style={{ marginBottom: 12 }}>
        Filtrar:{' '}
        <select value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="leyendo">Leyendo</option>
          <option value="leido">Leído</option>
        </select>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {librosFiltrados.map(l => (
          <li key={l.id} style={{ border: '1px solid #ccc', borderRadius: 6, padding: 10, marginBottom: 8 }}>
            <strong>{l.titulo}</strong> — {l.autor} ({l.genero || 'sin género'})
            <br />
            Estado: {l.estado} {l.calificacion ? `· ⭐ ${l.calificacion}` : ''}
            <br />
            <button onClick={() => editar(l)}>Editar</button>{' '}
            <button onClick={() => borrar(l.id)}>Borrar</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
