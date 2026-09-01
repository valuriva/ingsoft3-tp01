# Decisiones - TP1

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
