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
