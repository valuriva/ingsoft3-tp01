using BibliotecaApi.Models;
using BibliotecaApi.Servicios;

namespace BibliotecaApi.Data;

// Pegamento con la base de datos: no tiene reglas de negocio.
public class RepositorioLibros : IRepositorioLibros
{
    private readonly AppDbContext _db;

    public RepositorioLibros(AppDbContext db)
    {
        _db = db;
    }

    public bool ExisteDuplicado(string titulo, string autor) =>
        _db.Libros.Any(l => l.Titulo == titulo && l.Autor == autor);

    public void Agregar(Libro libro)
    {
        _db.Libros.Add(libro);
        _db.SaveChanges();
    }
}
