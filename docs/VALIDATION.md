# Validación · 22 noviembre 2026

## Selección por alcance

Aplicación nueva e independiente, sin dependencias de ejecución ni cambios en los otros juegos. Se prueban sus tres módulos de modelo, sus pantallas/estados y el ciclo de instalación/caché; no se ejecutan suites de otros repositorios.

- `npm ci --ignore-scripts --no-audit --no-fund`: instalación real desde lockfile público. La primera resolución intentó un registro corporativo global y recibió 403; no se reintentó contra él ni se cambiaron credenciales. El proyecto fija el registro público de npm y verifica la misma integridad del paquete.
- `npm run check`: **21/21 tests** y build estático en verde. Generadores en 100 semillas por tema y RNG extremos; opciones únicas, sumas/restas y límites, saneamiento, sesiones inválidas, perfiles, reparto por tema y persistencia. Rojo inicial y correcciones focales antes de verde.
- `npm run test:e2e`: **12/12 casos** en Chromium y WebKit. Catálogo/seis temas; cursos vacíos; respuestas incorrectas y reintento; resumen y recarga; perfiles aislados; repaso mixto de 12; almacenamiento bloqueado; foco de teclado; alternativas accesibles; guardado tras edición desde otra pestaña.
- Viewports 360, 768 y 1280 px: sin desbordamiento horizontal. Capturas revisadas de inicio escritorio, inicio móvil y ejercicio móvil en `docs/evidence/`.
- Chromium: desconexión real de la red del contexto, recarga y nueva actividad desde caché; caché de otro juego conservada.
- WebKit: interfaz, teclado e inventario del caché verificados. **No se acredita recarga offline real en WebKit**: su runtime falla en navegación al activar offline (`internal error`) y al interceptar la red (`Blocked by Web Inspector`). Se cambió de estrategia y se documentó el límite, sin simular éxito ni retirar la prueba offline de Chromium.

## Correcciones derivadas de evidencia

Se corrigieron el reparto de temas del repaso mixto, referencias obsoletas entre pestañas, foco perdido al pedir pista/cambiar curso y alternativas no visuales para contar y reconocer figuras. Las sesiones capturan el perfil propietario; se relee el estado compartido inmediatamente antes de guardar. No hay transacciones multiproceso ni sincronización remota.

## Límites

No probado en tablet física, instalación nativa Android/iOS, Chrome95 real, lector de pantalla humano ni voces offline. No certificación WCAG ni revisión docente. Las sesiones incompletas no se guardan y salir exige confirmación. No se migra progreso de otros juegos. En una actualización, el service worker conserva solo su caché vigente; otras aplicaciones no se alteran. Una pestaña abierta puede terminar con la versión anterior hasta volver a abrirla.

## Autoevaluación

Exactitud 4/5 (modelo y flujos comprobados; límite WebKit declarado); completitud 4/5 (primer pack y base extensible, no currículo completo); claridad 4/5 (zona familiar y documentación de ampliación); accionabilidad 5/5 (PWA estática y tooling reproducible); concisión 4/5 (sin backend ni dependencias de ejecución). Siguientes mejoras con nueva actividad: ampliar variantes didácticas y revisión supervisada en tablet.

## Entrega publicada

Repositorio público independiente `cmlozanos/cole-aventura`, rama `main`. Primer commit funcional `b9eb331`. GitHub Pages respondió HTTP 200. La ejecución Actions `45009907791` terminó en **success**, con instalación limpia, tests de modelo, build y seis flujos Chromium antes de desplegar.

El primer intento fue rechazado porque GitHub creó automáticamente el entorno `github-pages` restringido a `master` cuando el repositorio aún estaba vacío. Se consultaron entorno y reglas reales y se añadió únicamente `main` a las ramas permitidas para este nuevo repositorio; no se desactivó la protección ni se tocaron otros repositorios. La reejecución terminó correctamente.

`APP_URL=https://cmlozanos.github.io/cole-aventura/ npm run test:e2e -- --project=chromium`: **6/6 en verde sobre la web pública**, incluido recarga offline, sesión completa, progreso y perfiles. Comparación binaria de los archivos publicados `index.html`, `src/app.js`, `src/styles.css`, `src/storage.js`, `sw.js` y `manifest.webmanifest` contra `dist/`: todos coinciden. Evidencia en `docs/evidence/browser-published.txt`. La última entrega documental no cambia los bytes de la aplicación.

Temporales de pruebas descartados; se conservan únicamente código, dependencias locales necesarias, build utilizable y evidencia de entrega. No se modificaron los juegos existentes ni sus catálogos.
