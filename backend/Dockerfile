# ---- Etapa 1: build (imagen con SDK) ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY BibliotecaApi/BibliotecaApi.csproj BibliotecaApi/
RUN dotnet restore BibliotecaApi/BibliotecaApi.csproj

COPY . .
RUN dotnet publish BibliotecaApi/BibliotecaApi.csproj -c Release -o /app/publish

# ---- Etapa 2: runtime (imagen minima, sin SDK) ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "BibliotecaApi.dll"]
