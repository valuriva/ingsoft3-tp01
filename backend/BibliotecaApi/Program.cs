using BibliotecaApi.Data;
using BibliotecaApi.Logica;
using BibliotecaApi.Models;
using BibliotecaApi.Servicios;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? "Host=localhost;Database=app;Username=postgres;Password=postgres";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Dependencias del servicio (si falta alguna, la app falla en el primer pedido)
builder.Services.AddScoped<IRepositorioLibros, RepositorioLibros>();
builder.Services.AddScoped<ServicioDeLibros>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

app.UseCors();

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

app.MapPost("/api/libros", (Libro libro, ServicioDeLibros servicio) =>
{
    try
    {
        var creado = servicio.Crear(libro);
        return Results.Created($"/api/libros/{creado.Id}", creado);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(ex.Message);
    }
    catch (InvalidOperationException ex)
    {
        return Results.Conflict(ex.Message);
    }
});

app.MapPut("/api/libros/{id:int}", async (int id, Libro input, AppDbContext db) =>
{
    var libro = await db.Libros.FindAsync(id);
    if (libro is null) return Results.NotFound();

    var validacion = LibroValidator.Validar(input);
    if (!validacion.EsValido) return Results.BadRequest(validacion.Error);

    if (!LibroValidator.TransicionPermitida(libro.Estado, input.Estado))
        return Results.BadRequest("Un libro leído no puede volver a pendiente.");

    libro.Titulo = input.Titulo.Trim();
    libro.Autor = input.Autor.Trim();
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
