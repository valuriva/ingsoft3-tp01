namespace BibliotecaApi.Models;

public class Libro
{
    public int Id { get; set; }
    public string Titulo { get; set; } = "";
    public string Autor { get; set; } = "";
    public string Genero { get; set; } = "";
    // Estado: "pendiente" | "leyendo" | "leido"
    public string Estado { get; set; } = "pendiente";
    public int? Calificacion { get; set; } // 1 a 5, opcional
}
