using BibliotecaApi.Logica;
using BibliotecaApi.Models;
using Xunit;

namespace BibliotecaApi.Tests;

public class LibroValidatorTests
{
    private static Libro LibroValido() => new()
    {
        Titulo = "Orgullo y prejuicio",
        Autor = "Jane Austen",
        Genero = "Romance",
        Estado = "leido",
        Calificacion = 5
    };

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("\t")]
    public void TituloSinContenido_EsRechazado(string titulo)
    {
        var libro = LibroValido();
        libro.Titulo = titulo;

        var resultado = LibroValidator.Validar(libro);

        Assert.False(resultado.EsValido);
    }

    [Fact]
    public void TituloDemasiadoLargo_ExplicaElLimiteEnElMensaje()
    {
        var libro = LibroValido();
        libro.Titulo = new string('a', LibroValidator.LargoMaximo + 1);

        var resultado = LibroValidator.Validar(libro);

        Assert.False(resultado.EsValido);
        Assert.Contains(LibroValidator.LargoMaximo.ToString(), resultado.Error);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    [InlineData(-1)]
    public void CalificacionFueraDeRango_EsRechazada(int calificacion)
    {
        var libro = LibroValido();
        libro.Calificacion = calificacion;

        var resultado = LibroValidator.Validar(libro);

        Assert.False(resultado.EsValido);
    }

    [Fact]
    public void CalificarUnLibroQueNoEstaLeido_EsRechazado()
    {
        var libro = LibroValido();
        libro.Estado = "leyendo";
        libro.Calificacion = 4;

        var resultado = LibroValidator.Validar(libro);

        Assert.False(resultado.EsValido);
        Assert.Contains("leído", resultado.Error);
    }

    [Theory]
    [InlineData("leido", "pendiente", false)]   // la única transición prohibida
    [InlineData("leido", "leyendo", true)]
    [InlineData("pendiente", "leyendo", true)]
    [InlineData("leyendo", "leido", true)]
    public void Transicion_RespetaLaRegla(string actual, string nuevo, bool esperado)
    {
        var permitida = LibroValidator.TransicionPermitida(actual, nuevo);

        Assert.Equal(esperado, permitida);
    }

    [Fact]
    public void LibroValido_EsAceptado()
    {
        var resultado = LibroValidator.Validar(LibroValido());

        Assert.True(resultado.EsValido);
        Assert.Null(resultado.Error);
    }
}
