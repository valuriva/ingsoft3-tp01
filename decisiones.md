# TP1: DECISIONES

## 1. ¿Por qué Git no pudo resolver el conflicto solo?
Las ramas A y B partieron ambas del main y modificaron la misma línea del REDME (el título), cada una con un contenido distinto.
Git fusiona automáticamente cuando los cambios tocan partes distintas del archivo, pero no cuando dos ramas cambian la misma línea, 
por lo que no tiene poder de decisión para ver cual de las dos versiones es la correcta (no es un problema que se pueda resolver con 
un comando si no es que una desición que debe tomar una persona). Por esto Git delega la decisión marcando así el archivo con los 
delimitadores '<<<<', '====', y '>>>>'.

## 2. Problemas que encontre y como los solucione

-- Push directo rechazado: al probar la protección de main intenté pushear directo y GitHub lo rechazó.
Pero esto era lo que se esperaba porque confirma que la protección de la rama estaba bien configurada. 
-- Conflicto al mergear la rama B: al crear la rama B desde el mainndespues de mergear la rama A, GitHub avisó que el PR de B no se 
podía mergear automáticamente porque tocaba la misma línea que ya había cambiado A. Lo resolví desde la web con "Resolve conflicts":
elegí que versión del título dejar, borre los tres marcadores del conflicto y confirme en Commit merge. 

## 3. Declaración de uso de IA

Use Claude como guía de paso a paso durante el trabajo práctico, pero todos los comandos y los pasos los fuí verificando con el 
checkpoints que se encontraban en la guía del trabajo, que a su vez tenía en otra pantalla el video hecho por el profesor como referencia para ir 
comparando los pasos. 

## TP2: CONTENEDORES 

### App elegida 
"Mi Biblioteca": es un gestor de libros para uso personal (título, autor, género, estado de lectura, puntuación).
Cumple con los 5 criterios: corre localmente, conozco los comandos de build ('dotnet publish', 'npm run build'), la conexión a la base es parametrizable por una variable de entorno ('ConnectionStrings__Default'). Hoy es un CRUD simple: para el TP5 voy a sumarle reglas de negocio: no permitir libros duplicados (mismo título+autor), etc.

### Decisiones de contenerización 
-- Backend: imagen base `mcr.microsoft.com/dotnet/sdk:8.0` para build y y `mcr.microsoft.com/dotnet/aspnet:8.0` para runtime (multi-stage). La imagen final pesa 329MB contra 1.2GB del SDK.
- Frontend: build con `node:22-alpine`, servido en producción con `nginx:alpine`, que además hace de proxy hacia `/api` para evitar CORS.
- Persistencia: la base de datos usa un volumen nombrado (`db_data`), separado del ciclo de vida de los contenedores. Probé que `docker compose down/up` conserva los datos y que `down -v` los borra.
- Secretos: la contraseña de la base vive en `.env` (no versionado), con `.env.example` como plantilla.

### Problemas encontrados 
- Docker Desktop estaba cerrado la primera vez que corrí `docker compose up`, lo que daba un error de conexión, se resolvió abriendo la app y esperando a que el motor arrancara.
- El puerto 3000 ya estaba en uso por un contenedor de otra materia lo cual bloqueaba el levantamiento del frontend, y lo resolví deteniendo ese contenedor.

### Uso de la IA
Use Claude para generar el scaffold inicial del backend (.NET minimal API + EF Core) y el frontend (React), y para guiarme paso a paso en escribir los Dockerfiles, el docker-compose, y publicar las imagenes en ghcr.io. Verifique cada paso con los checkpoints de la guía: que la API respondiera en `/health`, que el sistema funcionara end-to-end en el navegador, que la persistencia se comportara como se esperaba (sobrevive a `down`, se borra con `down -v`), y que las imágenes publicadas puedieran descargar sin estar autenticada. 

## TP3: PLANIFICACIÓN Y TRAZABILIDAD

### Duración del sprint 
Elegí sprints de 1 semana, porque la cátedra entrega tps con cada una semana y quiero que cada sprint cierre alineado con eso, evita tener "a medio sprint" cuando llega la fecha de entrega del tp.

### Límite de trabajo en progreso 
Configuré el límite en 2, ya que como estoy trabajando sola es 1 por persona más 1 de margen. El más 1 de margen me permite tener algo esperando (ej: una revisión, o un PR abierto sin mergear) sin que eso bloquee para avanzar en otra tarea. 

### Diagnóstico de la historia mal escrita
La historia "Como desarrollador quiero crear la tabla usuarios para guardar los datos" está mal
escrita porque en realidad es una "tarea disfrazada de historia": nadie "quiere" una tabla en sí
misma, quiere la capacidad que esa tabla habilita (por ejemplo, poder registrarse). La reescribiría
como: "Como usuario quiero poder registrarme con mi email para acceder a la aplicación", y
"crear la tabla usuarios" pasaría a ser una de sus tareas técnicas, no la historia completa.

### Problemas encontrados 
- `gh project list` tiraba error de permisos, pero se resolvió con `gh auth refresh -s project`
- Al crear el PR con `gh pr create`, apareció un aviso de "1 uncommitted change" que correspondía a un cambio pendiente de `docker-compose.registry.yml` del tp2, sin relación con este PR, se resolvió comiteándolo aparte antes de mergear.

### Uso de IA 
Usé Claude para guiarme paso a paso en la creación de la jerarquía de issues (épica, historia,
tareas, bug), la configuración del Project (visibilidad pública, sprint, tablero, límite de WIP),
y la trazabilidad vía `Closes #N`. Verifiqué cada paso con los checkpoints de la guía: que la
jerarquía fuera navegable (sub-issues reales, no task-lists), que el Project abriera sin login en
una ventana de incógnito, y que al mergear el PR la tarea se cerrara sola y se moviera a Done en
el tablero.

## TP4 — CI: Pipelines as Code

### Estructura del pipeline
Dos jobs en paralelo, `build-backend` y `build-frontend`, porque mi app tiene un Dockerfile
separado para cada uno (del TP2). Cada job corre en su propia maquina limpia y no comparte
filesystem con el otro, asi que no tiene sentido combinarlos en uno solo.

### Cache
El pipeline cachea las capas de Docker con `type=gha`, con un `scope` distinto por job
(`backend` y `frontend`) para que no se pisen entre si. En la segunda corrida del mismo PR se ve
la palabra `CACHED` en las capas que no cambiaron. Si el cache desaparece, el pipeline funciona
igual, solo que mas lento, no depende de el para pasar.

### Por que construye con el Dockerfile del TP2
Para no tener dos definiciones de build distintas (una en el pipeline y otra en el Dockerfile)
que puedan divergir. Asi lo que se verifica en el pipeline es exactamente lo mismo que después
se desplegaria.

### Problemas encontrados
- Al reescribir el README con notepad, el archivo se corrompio por un problema de codificación
  de caracteres (tildes rotas) — se resolvió reescribiendo el archivo completo por consola con
  `Out-File -Encoding utf8`.
- Se me desordenaron un par de ramas locales al armar el PR del badge — se resolvio arrancando
  una rama nueva limpia desde `main` actualizado.
- Al configurar el gate antes de que los jobs hubieran corrido una vez, no aparecian en el
  buscador de checks — se resolvio corriendo el workflow primero y recien despues configurando
  la proteccion.

### Uso de IA
Use Claude para guiarme paso a paso en escribir el workflow (jobs en paralelo, cache con scope),
configurar el gate de status checks, y armar la demostración de compilación rota -> bloqueado ->
fix -> verde -> merge. Verifique cada paso con los checkpoints de la guía: que el pipeline
corriera solo al abrir el PR, que la segunda corrida mostrara `CACHED`, que el botón de merge
quedara bloqueado con el check en rojo, y que el badge llevara al historial real de corridas.

## TP5 - Calidad automatizada: tests, coverage y umbral

### Que logica elegi testear y por que
Teste las reglas de negocio de Mi Biblioteca: titulo obligatorio y con largo maximo, calificación entre 1 y 5, solo se puede calificar un libro leído, un libro leído no vuelve a pendiente, y no se repite título + autor. Son las reglas donde un bug deja datos inconsistentes en la base. Las saque de Program.cs a clases (LibroValidator y ServicioDeLibros) porque dentro de los lambdas ningun test podia llamarlas.

### Refactor para poder mockear
ServicioDeLibros creaba su acceso a datos adentro, asi que no habia forma de reemplazarlo desde un test. Ahora recibe una interfaz (IRepositorioLibros) por constructor, y los tests usan un doble con Moq para verificar que el libro se guarda una sola vez, y que NO se guarda si es inválido o duplicado. En Program.cs hay que registrar la dependencia, porque si falta la app falla en el primer pedido aunque los tests pasen; lo verifique con una llamada real a la API después del refactor.

### Umbral de cobertura
Backend: umbral de 70% sobre lineas. Hoy mide 97,3% de lineas (37 de 38) y 92,3% de ramas (24 de 26). Frontend: umbral de 80% en lineas y en ramas; hoy mide 60% de lineas y 95,45% de ramas. Elegí el 70 del backend antes de medir y, mirando el resultado, es holgado: el gate solo me frenaría si la cobertura cayera mucho. Si lo repitiera, lo subiría cerca del 90 para que frene antes. Para sostener un número así de alto tendría que testear los endpoints de Program.cs, que hoy no tienen tests y quedan afuera de la cuenta.

### Que deje afuera de la cuenta y por que
Backend: Program (arranque y rutas, sin reglas de negocio), la carpeta Data (el DbContext y el repositorio, que solo hacen de pegamento con la base) y los modelos (clases con solo propiedades). Frontend: solo cuenta src/lib, donde vive la lógica pura; los componentes de UI se verifican end-to-end más adelante. No excluyo lógica de negocio: las reglas estan en Lógica y Servicios, y esas si cuentan.

### Por que coverage alto no garantiza calidad
Un test que llama a LibroValidator.Validar sin ningún Assert ejecuta todas las líneas y sube la cobertura sin verificar nada. La cobertura mide que se ejecuto, no que se comprobo.

### El camino sin cubrir
En LibroValidator.Validar queda sin cubrir el return de "El estado debe ser pendiente, leyendo o leído", que es la única línea sin cubrir del reporte. La recorrería un libro con estado "archivado". Decisión: no agregue el test, porque el frontend solo ofrece los tres estados válidos y la regla de estado no es la que más riesgo tiene; si la API quedara expuesta a otros clientes, lo agregaría.

### Pull Request bloqueado por cobertura
En el PR https://github.com/valuriva/ingsoft3-tp01/pull/30 agregue la función prioridadDe sin tests. Compilaba y todos los tests pasaban, pero build-frontend quedo en rojo porque las líneas cayeron por debajo del 80% (corrida roja: https://github.com/valuriva/ingsoft3-tp01/actions/runs/39420616325). Escribí un test por cada camino de la función, el check paso a verde y mergee. Deje abierto el PR https://github.com/valuriva/ingsoft3-tp01/pull/31, con el mismo problema sin arreglar, como prueba de que el freno sigue activo.

### Problemas encontrados
- Estaba trabajando en una copia vieja del repo (en OneDrive) que no tenia el workflow ni los últimos commits; lo detecte con git log y volví a la carpeta correcta.
- Al usar notepad el README se corrompio por la codificación; desde entonces escribo los archivos por consola con Out-File.

### Uso de IA
Use Claude para guiarme en el refactor, escribir la suite y configurar el pipeline. Verifique cada paso corriendo los tests en local y dentro de Docker, comprobando que el job se ponga rojo bajo el umbral, y probando la API real con una llamada despues del refactor. Puedo explicar que verifica cada assert y que caso no esta cubierto.

## TP6: CD: environments, aprobaciones y deployment patterns 

- **Paquetes públicos en GHCR (Registry):**
  - Backend: `ghcr.io/valuriva/ingsoft3-tp01-backend`
  - Frontend: `ghcr.io/valuriva/ingsoft3-tp01-frontend`
- **Cadena de verificación del Registry (Evidencias de confiabilidad):**
  - [Corrida de PR con tests en verde (Paso "Entrar al registry" salteado)](https://github.com/valuriva/ingsoft3-tp01/actions)
  - [Corrida de main con publicación como ÚLTIMO paso del job](https://github.com/valuriva/ingsoft3-tp01/actions)
- **Entornos desplegados:**
  - **Entorno QA:**
    - Frontend QA: `https://miapp-front-qa.onrender.com`
    - API QA: `https://miapp-api-qa-eduo.onrender.com`
  - **Entorno Producción (PROD):**
    - Frontend PROD: `https://miapp-front-prod.onrender.com`
    - API PROD: `https://miapp-api-prod-oksk.onrender.com`
   
  ### 1. El Artefacto y Confiabilidad del Registry
Un pipeline que no produce un artefacto verificado no es Integración Continua, es simple compilación. Si las imágenes se publicaran sin verificar o cuando los tests fallan, el registry dejaría de ser la "fuente de verdad" de binarios confiables y pasaría a ser un almacén de versiones rotas.

La confiabilidad del registry se sostiene por la cadena ininterrumpida de tres reglas:
1. **Nada entra a `main` sin pasar los tests y métricas de CI.**
2. **Únicamente los eventos de `push` sobre la rama `main` tienen permisos para publicar.**
3. **El paso de construcción y publicación a GHCR es el ÚLTIMO paso del job.** Si los tests fallan antes, el runner detiene la ejecución inmediatamente y el comando de publicación nunca llega a ejecutarse.

### 2. Continuous Delivery vs Continuous Deployment
En este proyecto implementamos **Continuous Delivery**.
- Cada cambio validado se empaqueta y despliega automáticamente al entorno de **QA**.
- El paso hacia **Producción** requiere una aprobación humana explícita (*Required Reviewers*) antes de ejecutarse.

Elegí Continuous Delivery porque en nuestro contexto de negocio preferimos mantener un control explícito sobre el momento del impacto en los usuarios finales, permitiendo coordinar tiempos de release, verificar evidencias de QA y minimizar ventanas de riesgo, en lugar de desplegar a producción sin supervisión.

### 3. Diseño de la Cadena y Alcance de Secrets
El pipeline en `.github/workflows/ci.yml` está estructurado en 4 jobs independientes: `build-backend`, `build-frontend`, `deploy-qa` y `deploy-prod`.

- **Aislamiento de Secrets:** Los secretos de los despliegues (`RENDER_DEPLOY_HOOK_*`) no se definieron a nivel de repositorio global, sino atados al alcance (*scope*) de sus respectivos **Environments** (`qa` y `production`).
- **Seguridad:** Los secretos del entorno `production` son completamente invisibles para los jobs anteriores y solo se liberan al runner una vez que la aprobación manual fue concedida.
- **Garantía de Commit (`&ref=$GITHUB_SHA`):** Disparar el webhook con `&ref=$GITHUB_SHA` garantiza que Render construya exactamente el commit verificado y no la punta arbitraria de la rama en ese instante.

### 4. Criterios del Gate Humano y Evidencia de Rechazo
Antes de aprobar un despliegue a producción, el aprobador analiza los siguientes criterios:
1. Que el job `deploy-qa` y su *Smoke Test* hayan finalizado en verde.
2. Que la suite de pruebas unitarias e integración de backend y frontend mantengan la cobertura requerida.
3. Que no existan alertas críticas en las métricas del entorno de QA ni cambios no coordinados en el esquema de base de datos.

**Evidencia de Rechazo:** Se ejecutó un rechazo explícito documentado en GitHub Actions con el motivo: *"Se frena el despliegue a Producción para realizar una revisión manual de auditoría sobre los logs de QA y verificar tiempos de respuesta"*, demostrando que el gate frena la propagación cuando el criterio humano lo requiere.

### 5. Configuración del Front y Manejo del Free Tier
- **Inmutabilidad y Nginx Dinámico:** Se migró la configuración fija del frontend a la plantilla `default.conf.template`. Nginx lee `${BACKEND_URL}` y `${DNS_RESOLVER}` al arrancar el contenedor. Esto permite utilizar exactamente la misma lógica de imagen cambiando solo la variable de entorno según si corre en QA o PROD.
- **Letra Chica de la Infraestructura Gratuita:** 
  - Render suspende las instancias tras 15 minutos de inactividad. El primer request post-suspensión sufre un *cold start* de hasta 50 segundos.
  - Para evitar falsos negativos en el pipeline por *cold start*, el paso de **Smoke Test** implementa un bucle de reintentos en Bash (`seq 1 30` con `sleep 20`), permitiendo hasta 10 minutos de margen para la activación de la API y la base de datos en Neon.
- **Limitación de Reconstrucción en Render:** Render vuelve a construir el código fuente desde el repositorio al recibir el hook en lugar de consumir directamente la imagen Docker publicada en GHCR. 

### 6. Estrategia de Deployment en Producción y Plan de Rollback

#### Blue-Green Deployment + Feature Flags
Para un entorno de producción real, la estrategia es **Blue-Green Deployment** combinado con **Feature Flags**:
- **Por qué:** Permite mantener dos entornos de infraestructura idénticos. El tráfico se conmuta de manera instantánea mediante el balanceador de carga sin sufrir ventanas de inactividad (*downtime*).
- **Observabilidad requerida:** Para operar esta estrategia con seguridad nos faltaría contar con métricas en tiempo real (APM/Prometheus), monitoreo de tasa de errores (Sentry) y trazabilidad distribuida para verificar la salud del ambiente Green antes de desaprovisionar el Blue.

#### Plan de Rollback Actual y Tiempo Medido
Si un despliegue aprobado en Producción presenta fallas no detectadas:
1. Se identifica el hash del último commit estable conocido en el historial de **Releases** / **Deployments** de GitHub.
2. Se ejecuta manualmente el disparo del Deploy Hook de Producción enviando el SHA del commit estable anterior:
   ```powershell
   curl.exe -X POST "[https://api.render.com/deploy/srv-dbcjmkivcj2c73esbf50?key=_uGkxy3ASJs&ref=642a3d6](https://api.render.com/deploy/srv-dbcjmkivcj2c73esbf50?key=_uGkxy3ASJs&ref=642a3d6)"

### Uso de IA

Se utilizó asistencia de Inteligencia Artificial como colaboradora de desarrollo para:

- La estructuración y optimización del flujo .github/workflows/ci.yml (jobs, condicionales needs, entornos y reintentos de smoke tests).
- La conversión del archivo de configuración de Nginx a plantilla dinámica (default.conf.template).
- La depuración de comandos de terminal (diferencias de sintaxis entre curl en Bash vs PowerShell).

**Verificación Humana:** Cada paso generado fue probado de forma manual mediante ejecuciones reales en GitHub Actions, verificación de bases aisladas en Neon PostgreSQL y comprobaciones de estado Live en la consola de Render.

# TP 7: Build Once, Deploy Many & Quality Gates

## 1. Estrategia de Artefactos e Imágenes Inmutables

Para implementar el patrón **Build Once, Deploy Many**, desacoplamos la etapa de compilación del despliegue en Render:

- **Construcción única**: GitHub Actions construye una sola vez la imagen de contenedor del backend y del frontend durante los jobs `build-backend` y `build-frontend`.
- **Registro de artefactos (GHCR)**: Las imágenes se publican en GitHub Packages (`ghcr.io`) etiquetadas de forma inmutable utilizando el SHA único del commit de Git:
  - Backend: `ghcr.io/valuriva/ingsoft3-tp01-backend:sha-${{ github.sha }}`
  - Frontend: `ghcr.io/valuriva/ingsoft3-tp01-frontend:sha-${{ github.sha }}`
- **Despliegue inmutable en Render**: Los servicios de Render en QA y Producción fueron configurados en modo **Existing Image**. El pipeline activa los despliegues enviando la variable `imgURL` a los Deploy Hooks de Render, garantizando que el exacto artefacto probado en QA sea el que se promueve a Producción.

## 2. Matriz de Entornos y Despliegue

| Entorno | Componente | URL / Endpoint | Estrategia de Despliegue |
| :--- | :--- | :--- | :--- |
| **QA** | Backend API | `https://miapp-api-qa-eduo.onrender.com` | Automático por Webhook (`imgURL`) |
| **QA** | Frontend | `https://miapp-front-qa.onrender.com` | Automático por Webhook (`imgURL`) |
| **PROD** | Backend API | `https://miapp-api-prod-oksk.onrender.com` | Gate Humano (Aprobación manual en GitHub) |
| **PROD** | Frontend | `https://miapp-front-prod.onrender.com` | Gate Humano (Aprobación manual en GitHub) |

## 3. Suites de Pruebas Automatizadas (Playwright)

Se integraron dos suites de pruebas utilizando **Playwright** en la carpeta `frontend/`:

1. **Pruebas de Integración (`e2e/api.spec.js`)**:
   - Pruebas HTTP directas contra la API de QA.
   - Verifican la creación, lectura y eliminación de registros en la base de datos de QA, así como el manejo de errores HTTP 400.
2. **Pruebas End-to-End (`e2e/libros.spec.js`)**:
   - Pruebas automatizadas sobre un navegador Chromium real interactuando con la interfaz gráfica del Frontend en QA.
   - Verifican la carga correcta de la interfaz, la absorción del tiempo de arranque (*cold start*) y la estabilidad visual.

## 4. Pipeline de CI/CD y Gates de Calidad

La secuencia del pipeline en `.github/workflows/ci.yml` asegura que ningún código defectuoso llegue a Producción:

$$\text{Build} \longrightarrow \text{Deploy QA} \longrightarrow \text{Integración (API)} \longrightarrow \text{E2E (Browser)} \longrightarrow \text{Deploy PROD (Gate Manual)}$$

- **Gate Automatizado**: Si el job `integracion` o `e2e` falla, la ejecución se interrumpe inmediatamente y el job `deploy-prod` ni siquiera llega a solicitar revisión.
- **Gate Humano**: El entorno `production` requiere la aprobación manual de un revisor en GitHub (*Required Reviewers*) antes de disparar los webhooks de Render para Producción.

## 5. Evidencias de Ejecución y Tareas del TP07

- **Evidencia Tarea 4 (Freno del Pipeline por Falla en Gate)**:
  - **Corrida de Freno**: Corrida `#55` (Commit `37e0112`).
  - **Resultado**: Integración 🟢 | E2E 🔴 | Deploy a Producción ⚪ (Frenado automáticamente).
  - **Diagnóstico**: La suite E2E detuvo la ejecución ante inconsistencias en la interfaz de QA, impidiendo la promoción a Producción.

- **Evidencia Tarea 5 (Promoción Exitosa a Producción)**:
  - **Ajuste**: Resolución de timeouts y compatibilidad en `feature/e2e-green-fix`.
  - **Resultado**: Build 🟢 | QA 🟢 | Integración 🟢 | E2E 🟢 | PROD 🟢 (Aprobado manualmente).
  - **Release / Etiqueta de Versión**: `v7.0.0` creada sobre el commit fusionado en `main`.

## Uso de IA

- **Herramientas utilizadas**: Asistente de IA (Gemini).
- **Alcance de la asistencia**: Se utilizó la IA como apoyo para la reestructuración del pipeline de CI/CD ("Build Once, Deploy Many"), la generación de scripts de pruebas con Playwright, la depuración de dependencias de Vitest/Playwright, la resolución de conflictos de ramas protegidas en Git y el armado de la documentación final.
- **Verificación y validación**: Cada línea de código HCL/YAML, archivo de configuración y script JS fue validado localmente en PowerShell y ejecutado en GitHub Actions, verificando activamente las corridas fallidas (freno de gate) y exitosas antes de la promoción a Producción.

@'

## TP 8: Infraestructura como Código (IaC) y Entorno Efímero de Preproducción

### 1. Contexto y Objetivos
El objetivo principal de este trabajo práctico es aprovisionar de manera automatizada y reproducible un entorno transitorio (efímero) de preproducción (`preprod`), permitiendo validar la integración y despliegue continuo de la aplicación antes de pasar a producción, siguiendo las prácticas de Infraestructura como Código (IaC).

### 2. Herramientas y Proveedores Seleccionados
- **Orquestador de IaC**: Terraform (v1.5+). Se seleccionó Terraform por su enfoque declarativo, gestión explícita del estado (`terraform.tfstate`) y amplio ecosistema de proveedores.
- **Base de Datos (Neon Provider `kislerdm/neon` v0.18.0)**: Se utilizó el proveedor de Neon para aprovisionar automáticamente el proyecto PostgreSQL serverless (`miapp-preprod`), el usuario/rol (`app_preprod_owner`) y la base de datos (`app_preprod`).
- **Cómputo / Plataforma de Aplicación (Render Provider `render-oss/render` v1.9.1)**: Se utilizó el proveedor de Render para administrar los Web Services del Backend (`miapp-api-preprod`) y Frontend (`miapp-front-preprod`).

### 3. Decisiones Arquitectónicas Clave

#### A. Inmutabilidad de Artefactos (Integración con TP07)
En lugar de compilar código fuente durante el aprovisionamiento, los servicios web en Render consumen imágenes Docker inmutables previamente publicadas en GitHub Container Registry (GHCR) en el TP07, identificadas unívocamente por su tag SHA:
- **API Backend**: `ghcr.io/valuriva/ingsoft3-tp01-backend:sha-e9d26d831d7f2f89fa1db61741a1c6aabf7cfe15`
- **Frontend**: `ghcr.io/valuriva/ingsoft3-tp01-frontend:sha-e9d26d831d7f2f89fa1db61741a1c6aabf7cfe15`

#### B. Seguridad y Gestión de Secretos
- **Sin credenciales hardcodeadas**: Ningún token, clave de API ni contraseña de base de datos se guarda en el código de Terraform.
- **Variables de Entorno**: La autenticación con los proveedores se gestiona de forma segura mediante variables de entorno en la terminal (`NEON_API_KEY`, `RENDER_API_KEY`, `RENDER_OWNER_ID`).
- **Soporte para Cuentas Organizacionales y Equipos**:
  - Para Neon, se configuró explícitamente el `org_id` (`org-orange-base-06884905`).
  - Para Render, se configuró el `owner_id` correspondiente al espacio de trabajo de equipo (`tea-dbchb4jrjlhs73bg8fi0`).

#### C. Interconexión Dinámica entre Servicios
- La cadena de conexión a la base de datos (`ConnectionStrings__Default`) se compone dinámicamente mediante un bloque `locals` utilizando los atributos generados por los recursos de Neon (`database_host`, `name`, `password`).
- La URL pública asignada al Backend por Render se inyecta de forma automática en la variable de entorno `BACKEND_URL` del Frontend (`render_web_service.api.url`).

#### D. Carácter Efímero
Toda la definición de la infraestructura se encuentra aislada en el directorio `infra/`. Al ser un entorno de preproducción transitorio, el ciclo de vida completo puede ser creado en minutos con `terraform apply` y destruido completamente con `terraform destroy` para optimizar el consumo de recursos.
'@ | Out-File -FilePath "decisiones.md" -Encoding utf8 -Append

### 4. Uso de la IA
Durante el desarrollo del TP08, se utilizó un asistente de IA como herramienta colaborativa para las siguientes tareas:

- **Diagnóstico y Resolución de Errores de Aprovisionamiento**:
  - Identificación del error `org_id is required` en el proveedor de Neon, determinando la necesidad de explicitar la organización institucional (`org-orange-base-06884905`).
  - Resolución del error `invalid ownerID` en el proveedor de Render mediante la consulta a la API `/v1/owners`, identificando que la cuenta operaba bajo un ID de equipo (`tea-dbchb4jrjlhs73bg8fi0`) y no un ID de usuario personal (`usr-`).

- **Estructuración e Integración de Código de Infraestructura**:
  - Asistencia en la definición declarativa de recursos en Terraform (`main.tf`, `variables.tf`, `outputs.tf`) para vincular dinámicamente las credenciales de la base de datos de Neon con las variables de entorno del servicio API en Render.
  - Aseguramiento de la inmutabilidad reutilizando los tags de imagen Docker compilados previamente en el TP07 (`sha-e9d26d831d7f2f89fa1db61741a1c6aabf7cfe15`).

- **Automatización y Documentación**:
  - Generación de scripts en PowerShell para la inyección limpia de variables de entorno sin exponer secretos en el repositorio.
  - Redacción y estructuración del informe de decisiones de arquitectura (`decisiones.md`).
'@ | Out-File -FilePath "decisiones.md" -Encoding utf8 -Append
