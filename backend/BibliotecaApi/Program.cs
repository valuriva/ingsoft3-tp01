
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? "Host=localhost;Database=app;Username=postgres;Password=postgres";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

app.UseCors();

// Crea las tablas si no existen (sin migraciones, para simplificar el TP)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapGet("/api/libros", async (AppDbContext db) =>
    await db.Libros.OrderBy(l => l.Titulo).ToListAsync());

app.MapGet("/api/libros/{id:int}", async (int id, AppDbContext db) =>
    await db.Libros.FindAsync(id) is Libro libro ? Results.Ok(libro) : Results.NotFound());

app.MapPost("/api/libros", async (Libro libro, AppDbContext db) =>
{
    db.Libros.Add(libro);
    await db.SaveChangesAsync();
    return Results.Created($"/api/libros/{libro.Id}", libro);
});

app.MapPut("/api/libros/{id:int}", async (int id, Libro input, AppDbContext db) =>
{
    var libro = await db.Libros.FindAsync(id);
    if (libro is null) return Results.NotFound();

    libro.Titulo = input.Titulo;
    libro.Autor = input.Autor;
    libro.Genero = input.Genero;
    libro.Estado = input.Estado;
    libro.Calificacion = input.Calificacion;

    await db.SaveChangesAsync();
    return Results.Ok(libro);
});

app.MapDelete("/api/libros/{id:int}", async (int id, AppDbContext db) =>
{
    var libro = await db.Libros.FindAsync(id);
    if (libro is null) return Results.NotFound();

    db.Libros.Remove(libro);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();

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

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Libro> Libros => Set<Libro>();
}
