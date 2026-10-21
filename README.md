# Mi Biblioteca

[![CI](https://github.com/valuriva/ingsoft3-tp01/actions/workflows/ci.yml/badge.svg)](https://github.com/valuriva/ingsoft3-tp01/actions/workflows/ci.yml)

Gestor de libros personal: backend en .NET 8 (minimal API), frontend en React + Vite,
base de datos PostgreSQL. Proyecto del semestre para Ingenieria en Software 3.

## Como levantar el sistema completo (en una maquina limpia).

Prerequisito: tener Docker instalado y corriendo.

```bash
git clone https://github.com/valuriva/ingsoft3-tp01.git
cd ingsoft3-tp01
cp .env.example .env
docker compose up -d --build
```

- Frontend: http://localhost:3000
- Backend (API): http://localhost:8080
- Health check: http://localhost:8080/health

## Levantar usando las imagenes publicadas (sin build local).

```bash
cp .env.example .env
docker compose -f docker-compose.registry.yml up -d
```

## Apagar

```bash
docker compose down       # apaga, conserva los datos
docker compose down -v    # apaga y borra tambien los datos (el volumen)
```
