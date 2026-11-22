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

## Inicio, sesiones y movimiento (vigente)

Inicio expone los seis temas y sorpresa sin desbloqueos. `score-session.js` aísla la sesión de puntos: reloj inyectable, caducidad estricta tras60min sin interacción, IDs deduplicados y persistencia local con cookie de respaldo. Solo interacciones reales renuevan actividad; leer contador o esperar no la renueva. No modificar el modelo al añadir animaciones. `motion.js` agrupa/cancela animaciones por escena, sin frame-loop. `bootstrap.js` muestra carga durante importación real y permite reintento si falla. El menú de Opciones agrupa acciones manuales para no duplicar botones en el juego.

## Configuración adulta vigente

Los únicos controles infantiles son Inicio, pausa y acceso Adultos. `parent-gate.js` genera/valida multiplicación sin almacenar solución; el controlador destruye acceso al cerrar el diálogo. No se añaden opciones directamente a cabecera. La transición postacierto es `#transition` modal full-window sin controles, independiente de `#options` y del loader real de bootstrap. Los nuevos flujos deben probar fondo inoperable, teclado, autoreanudación, viewport y reduced-motion.

## Recorrido rápido vigente

Arranque en Sorpresa automático (sin botón inicial); selección manual disponible solo al volver a Inicio. No exponer pausa: suspender internamente por diálogo/visibilidad y reanudar automáticamente. Transición650ms, sin mínimos ficticios en bootstrap. Consignas cortas y operaciones simbólicas; las pistas gráficas y nombres accesibles siguen obligatorios.

## Lectura y apariencia

`theme.js` gestiona light/dark/system, escucha cambios sistema y persiste preferencia sin tocar sesión/audio. `reading.css` define paletas y fuentes locales. `reading.js` contiene vocabulario silabeado explícito y composición de minicuentos; no incorporar palabras sin segmentación validada. No usar algoritmos simples de vocales para texto arbitrario. Cada página debe caber desde320×568/667×375 y tener palabras con nombre accesible completo. El color no es único canal: subrayado sólido/punteado. `app.js` mantiene navegación de cuento independiente de generador matemático, con puntos por comprensión y voz condicionada al consentimiento adulto.

## Tipografía ligada única (vigente)

No hay selector de familia ni preferencia print activa. Todos los consumidores de texto heredan --reader=Playwrite ES, incluidos controles nativos y texto SVG. Mantener la misma fuente en nuevos botones/dialogs y probar métricas en móvil/horizontal; no reintroducir una familia distinta por conveniencia local.

## Sílabas transversales (vigente)

`syllable-lexicon.js` cubre vocabulario visible existente; añadir cualquier palabra nueva exige revisar segmentación y test de cobertura. `syllables.js` decora nodos de texto sin tocar HTML/atributos/valores/iconos ni motor de voz. MutationObserver aplica a renders y mensajes dinámicos, desconecta durante su propio cambio y no duplica spans. Los tokens de cuentos ya marcados quedan excluidos. No confundir apoyo por sílabas con acentuación tónica automática.

## Viewport e iconos de títulos

`viewport.js` fija --app-height desde área visible real; no reintroducir alturas100dvh sin fallback. Las pruebas de rotación esperan el evento resize del navegador antes de medir el layout estabilizado, en lugar de asumir sincronía con setViewportSize. `topic-icons.js` centraliza iconos SVG semánticos para todos los títulos de ejercicios/cuentos; no inferirlos desde la traducción. Mantener aria-hidden y texto original silabeado.
