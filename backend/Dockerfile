# ---- Etapa 1: build (imagen con SDK) ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY BibliotecaApi/BibliotecaApi.csproj BibliotecaApi/
COPY BibliotecaApi.Tests/BibliotecaApi.Tests.csproj BibliotecaApi.Tests/
RUN dotnet restore BibliotecaApi.Tests/BibliotecaApi.Tests.csproj

COPY . .
RUN dotnet publish BibliotecaApi/BibliotecaApi.csproj -c Release -o /app/publish

# ---- Etapa 2: tests (parte del build, con el SDK adentro) ----
FROM build AS test
ENTRYPOINT ["dotnet", "test", "BibliotecaApi.Tests/BibliotecaApi.Tests.csproj", \
            "/p:CollectCoverage=true", "/p:Threshold=70", "/p:ThresholdType=line", \
            "/p:CoverletOutputFormat=cobertura", "/p:CoverletOutput=/out/coverage/", \
            "/p:Exclude=[BibliotecaApi]BibliotecaApi.Data.*%2c[BibliotecaApi]BibliotecaApi.Models.*%2c[BibliotecaApi]Program*", \
            "--logger", "trx;LogFileName=tests.trx", "--results-directory", "/out"]

# ---- Etapa 3: runtime (imagen minima, sin SDK) ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "BibliotecaApi.dll"]
