# Ampliar el contenido

## Modelo

- `src/catalog.js`: cursos con ID estable y packs ligados a `courseId` y asignatura. Cada pack tiene temas con ID, título, descripción y símbolo.
- `src/exercises.js`: genera preguntas puras, con RNG inyectable, respuesta única, opciones barajadas, pista, explicación y visual. No accede al DOM ni guarda progreso.
- `src/storage.js`: almacena versión, perfiles y progreso por perfil → actividad → tema. Acepta solo actividades y temas conocidos; no reutilizar IDs con otro significado.
- `src/app.js`: composición de catálogo, práctica, resumen y zona familiar. Los visuales se representan en un único renderizador compartido. Navegación, respuestas y temas usan botones nativos, sin arrastres.

## Nuevo caso escolar

1. Convertir el mensaje en objetivos anónimos, curso y asignatura. No copiar mensajes, nombres, clase ni fechas privadas al repositorio público.
2. Añadir un pack con ID nuevo al catálogo y su banco/generador. Mantener contenido ausente como estado vacío, no como actividad disponible.
3. El catálogo UI ofrece selector de pack cuando un curso tiene más de uno y pasa la actividad activa al progreso. Adaptar `createSession` para seleccionar el generador del nuevo pack: el motor inicial implementa los seis temas de Matemáticas.
4. Para otros tipos de tarea, añadir un tipo visual/respuesta al contrato y su representación accesible, manteniendo la alternativa por teclado.
5. Probar límites, respuestas únicas, explicaciones, rutas de error, progreso aislado, móvil y uso offline. Revisar el contenido con un adulto/docente.

El primer pack usa problemas de una operación con enteros 0–10, sumas ≤10 y restas ≥0. En figuras, los rectángulos dibujados no son cuadrados para evitar opciones ambiguas; no se enseña que un cuadrado no pueda pertenecer a la familia de los rectángulos. El primer banco no cubre todos los enfoques didácticos de cada tema.

## Presentación infantil vigente

La portada ya no expone cursos sin actividades ni tablas de progreso: se centra en 1.º. `src/learning-visuals.js` convierte el contrato de pregunta en objetos SVG manipulables, grupos y recta numérica; `src/child.css` adapta las superficies infantiles sin cambiar la zona familiar. Las preguntas siguen siendo puras y los IDs de progreso permanecen estables. Cambiar de actividad o curso en una futura ampliación debe conservar esta separación y probar el nuevo recorrido infantil; no añadir menús vacíos por anticipado.

## Pantalla única vigente (sustituye navegación descrita antes)

`app.js` toma un tema aleatorio distinto del anterior y genera una pregunta nueva, sin sesión ni ficha fija. No hay navegación de cursos, modo familiar, perfiles ni resultados. `audio.js` mantiene canales independientes en memoria con ambos valores iniciales false. `child.css` usa grid de altura de viewport con distribución específica para horizontal corto. Nuevos tipos de contenido deben pasar las mediciones de scroll, rectángulos visibles y límites 0/10 antes de añadirse. Los módulos de catálogo y almacenamiento históricos siguen disponibles pero no implican controles en la interfaz.
