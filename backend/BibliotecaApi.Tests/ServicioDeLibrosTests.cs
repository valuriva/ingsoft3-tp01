using BibliotecaApi.Models;
using BibliotecaApi.Servicios;
using Moq;
using Xunit;

namespace BibliotecaApi.Tests;

public class ServicioDeLibrosTests
{
    private static Libro LibroNuevo() => new()
    {
        Titulo = "Rayuela",
        Autor = "Julio Cortázar",
        Estado = "pendiente"
    };

    [Fact]
    public void CrearUnLibroValido_LoGuardaUnaSolaVez()
    {
        // Arrange: el impostor reemplaza a la base de datos
        var repo = new Mock<IRepositorioLibros>();
        var servicio = new ServicioDeLibros(repo.Object);

        // Act
        servicio.Crear(LibroNuevo());

        // Assert: no mira un valor devuelto, mira la INTERACCIÓN
        repo.Verify(r => r.Agregar(It.IsAny<Libro>()), Times.Once);
    }

    [Fact]
    public void CrearUnLibroDuplicado_LanzaErrorYNoGuarda()
    {
        var repo = new Mock<IRepositorioLibros>();
        repo.Setup(r => r.ExisteDuplicado("Rayuela", "Julio Cortázar")).Returns(true);
        var servicio = new ServicioDeLibros(repo.Object);

        Assert.Throws<InvalidOperationException>(() => servicio.Crear(LibroNuevo()));

        repo.Verify(r => r.Agregar(It.IsAny<Libro>()), Times.Never);
    }

    [Fact]
    public void CrearUnLibroInvalido_LanzaErrorYNoGuarda()
    {
        var repo = new Mock<IRepositorioLibros>();
        var servicio = new ServicioDeLibros(repo.Object);
        var libro = LibroNuevo();
        libro.Titulo = "   ";

        Assert.Throws<ArgumentException>(() => servicio.Crear(libro));

        repo.Verify(r => r.Agregar(It.IsAny<Libro>()), Times.Never);
    }
}
