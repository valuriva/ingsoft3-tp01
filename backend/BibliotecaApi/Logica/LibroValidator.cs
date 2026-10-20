using BibliotecaApi.Models;

namespace BibliotecaApi.Logica;

public static class LibroValidator
{
    public const int LargoMaximo = 100;
    public static readonly string[] EstadosValidos = { "pendiente", "leyendo", "leido" };

    public sealed class Resultado
    {
        public Resultado(bool esValido, string? error)
        {
            EsValido = esValido;
            Error = error;
        }

        public bool EsValido { get; }
        public string? Error { get; }
    }

    public static Resultado Validar(Libro libro)
    {
        var titulo = libro.Titulo?.Trim();

        if (string.IsNullOrWhiteSpace(titulo))
            return new Resultado(false, "El título es obligatorio.");

        if (titulo.Length > LargoMaximo)
            return new Resultado(false, $"El título no puede superar {LargoMaximo} caracteres.");

        if (!EstadosValidos.Contains(libro.Estado))
            return new Resultado(false, "El estado debe ser pendiente, leyendo o leido.");

        if (libro.Calificacion is < 1 or > 5)
            return new Resultado(false, "La calificación debe estar entre 1 y 5.");

        if (libro.Calificacion is not null && libro.Estado != "leido")
            return new Resultado(false, "Solo se puede calificar un libro leído.");

        return new Resultado(true, null);
    }

    // Un libro leído no puede volver a pendiente.
    public static bool TransicionPermitida(string actual, string nuevo) =>
        !(actual == "leido" && nuevo == "pendiente");
}
