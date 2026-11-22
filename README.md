# Cole Aventura

[**Abrir la aplicación**](https://cmlozanos.github.io/cole-aventura/)

Matemáticas visuales para **1.º de Primaria**, sin anuncios ni cuentas. En Inicio están todos los juegos disponibles, sin bloqueos: números1–10, mayor/menor, sumas hasta10, restas sin negativos, problemas de una operación y figuras. «¡Sorpresa!» mezcla temas. Las preguntas se generan al vuelo y las respuestas se barajan; no hay fichas fijas.

## Jugar y puntos

Toca objetos para contar y elige una respuesta. Los errores muestran ayuda sin penalizar; resolver cada reto suma **1 punto**, una sola vez, incluso tras reintentos. El total se ve siempre en la cabecera, también al cambiar de juego o volver a Inicio.

La sesión conserva puntos al recargar/cerrar y volver a abrir. Si pasan **más de 60 minutos sin interacción de juego**, empieza una sesión a cero al regresar. Exactamente60 minutos no reinicia. Se mide actividad real (iniciar, responder, contar o continuar), no conexión a internet ni temporizadores de fondo. Estar offline no quita puntos si se sigue jugando. No se necesita cuenta ni se manda información a un servidor.

Persistencia: localStorage; si está bloqueado, cookie funcional limitada a la ruta de la app (`SameSite=Lax`, `Secure` en HTTPS); si ambos fallan, memoria temporal. El almacenamiento del navegador puede borrar datos y no hay sincronización entre dispositivos. Las pestañas se reconcilian secuencialmente, sin garantía transaccional si se responde simultáneamente en dos pestañas.

## Controles

Iconos de **Inicio**, **pausa**, **voz**, **efectos** y **opciones**. Los dos audios siempre empiezan apagados al cargar y se controlan independientemente. La voz depende del dispositivo y no se garantiza offline.

En Opciones se puede continuar, pedir otro reto manualmente, reiniciar puntos con confirmación y apagar animaciones. Pausar, ocultar o salir detiene sonidos y movimiento. Cambiar juego no borra puntos. No se borran datos históricos de versiones anteriores.

## Animaciones y carga

Carga real al importar el módulo, entradas escalonadas y celebración corta al acertar. No se simulan descargas ni se retrasan artificialmente preguntas locales. Se respeta `prefers-reduced-motion` y se puede desactivar movimiento manualmente. Los patrones se han comparado con Phaser, PixiJS, Motion y GSAP; decisión y fuentes oficiales en [docs/MOTION-RESEARCH.md](docs/MOTION-RESEARCH.md). Web Animations nativas, sin dependencias gráficas ni CDN.

Diseño sin scroll probado desde320×568 y667×375 hasta tablet/escritorio, incluidas ayudas y opciones. No se ocultan desbordamientos. No certificación WCAG, revisión docente ni prueba física de tablet.

## Instalar y desarrollo

Android: menú → Instalar aplicación. iOS: Compartir → Añadir a pantalla de inicio. Abrir primero con conexión para completar caché; después los ejercicios funcionan offline. Solo se limpian cachés de esta app.

Node20+, npm y Python3 para servidor local. Sin dependencias de ejecución.

```sh
make install       # dependencias de pruebas
make check         # modelo, visuales, audio, sesión y movimiento + build
make run           # http://127.0.0.1:4173
make test-browser  # Chromium y WebKit instalados
```

`npx playwright install chromium webkit` instala navegadores explícitamente si faltan. `APP_URL=https://… npm run test:e2e -- --project=chromium` comprueba una publicación. Documentación y evidencia en `docs/`; las decisiones recientes sustituyen descripciones históricas.
