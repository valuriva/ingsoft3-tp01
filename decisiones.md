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
