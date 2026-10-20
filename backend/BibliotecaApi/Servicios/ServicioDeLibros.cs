using BibliotecaApi.Logica;
using BibliotecaApi.Models;

namespace BibliotecaApi.Servicios;

public interface IRepositorioLibros
{
    bool ExisteDuplicado(string titulo, string autor);
    void Agregar(Libro libro);
}

public class ServicioDeLibros
{
    private readonly IRepositorioLibros _repo;

    public ServicioDeLibros(IRepositorioLibros repo)
    {
        _repo = repo;
    }

    public Libro Crear(Libro libro)
    {
        var validacion = LibroValidator.Validar(libro);
        if (!validacion.EsValido)
            throw new ArgumentException(validacion.Error);

        libro.Titulo = libro.Titulo.Trim();
        libro.Autor = libro.Autor.Trim();

        if (_repo.ExisteDuplicado(libro.Titulo, libro.Autor))
            throw new InvalidOperationException("Ya existe un libro con ese título y autor.");

        _repo.Agregar(libro);
        return libro;
    }
}
