import { useEffect, useState } from 'react'
import './App.css'

const vacio = { titulo: '', autor: '', genero: '', estado: 'pendiente', calificacion: '' }

const ETIQUETAS_ESTADO = {
  pendiente: 'Pendiente',
  leyendo: 'Leyendo',
  leido: 'Leído',
}

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
    <div className="app">
      <h1>📚 Mi Biblioteca</h1>

      <div className="form-card">
        <h2>{editandoId ? 'Editar libro' : 'Agregar libro'}</h2>
        <form onSubmit={guardar} className="form-grid">
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
          <button type="submit" className="btn-primary">
            {editandoId ? 'Guardar cambios' : 'Agregar libro'}
          </button>
        </form>
      </div>

      <div className="filtro-row">
        Filtrar por estado:
        <select value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="leyendo">Leyendo</option>
          <option value="leido">Leído</option>
        </select>
      </div>

      {librosFiltrados.length === 0 ? (
        <p className="vacio">Todavía no hay libros para mostrar.</p>
      ) : (
        <ul className="lista">
          {librosFiltrados.map(l => (
            <li key={l.id} className="libro-card">
              <div className="titulo">{l.titulo}</div>
              <div className="meta">
                {l.autor} {l.genero ? `· ${l.genero}` : ''}
              </div>
              <span className={`badge badge-${l.estado}`}>{ETIQUETAS_ESTADO[l.estado]}</span>
              {l.calificacion ? <span className="estrella">⭐ {l.calificacion}</span> : null}
              <div className="acciones">
                <button onClick={() => editar(l)}>Editar</button>
                <button className="borrar" onClick={() => borrar(l.id)}>Borrar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
