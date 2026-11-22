# Cole Aventura

[**Abrir la aplicación**](https://cmlozanos.github.io/cole-aventura/)

Matemáticas visuales para **1.º de Primaria**, en una pantalla y sin menús. Se abre directamente con un reto. Toca objetos para contar y elige la respuesta; al acertar llega otro reto aleatorio. Si fallas, se muestra ayuda visual y puedes intentarlo otra vez. Sin cronómetro de respuesta, anuncios, cuentas ni modo familia.

## Tres controles

- **Pausa / continuar**: detiene el juego y los audios.
- **Voz**: activar o desactivar lectura de consignas.
- **Nota musical**: activar o desactivar efectos de respuesta.

**Los dos audios están apagados cada vez que se carga la app**, incluso si se activaron anteriormente. No se crea un motor de sonido hasta que el usuario habilita efectos y responde. La voz depende del navegador y del dispositivo; no se garantiza offline.

## Contenido aleatorio

Cantidades 1–10, mayor/menor, sumas hasta 10, restas sin negativos, problemas de una operación y cuatro figuras. Los ejercicios se calculan al vuelo; no hay fichas predefinidas ni orden fijo. Se barajan temas y respuestas, evitando el mismo tema consecutivo. Las figuras cambian inclinación y los objetos cambian de color. La aleatoriedad respeta los límites del contenido escolar, no implica una generación ilimitada por IA.

Diseño sin scroll, comprobado desde 320×568 y 667×375 hasta tablet/escritorio. No se oculta contenido con `overflow:hidden`. Los objetivos táctiles principales conservan al menos 44 píxeles. Zoom extremo, traducciones del navegador y dispositivos no probados pueden necesitar ajustes.

## Instalar y sin conexión

Android: menú del navegador → Instalar aplicación. iPhone/iPad: Compartir → Añadir a pantalla de inicio. Abrir primero con conexión para completar el caché. El contenido funciona offline después de esa carga. La PWA solo elimina sus propias versiones de caché. No borra progreso antiguo, aunque esta versión ya no muestra perfiles ni resultados guardados.

## Desarrollo

Node 20+, npm y Python 3 para servidor local. Sin dependencias de ejecución.

```sh
make install       # dependencias de pruebas desde lockfile
make check         # modelo, renderizadores y audio + build PWA
make run           # http://127.0.0.1:4173
make test-browser  # Chromium y WebKit instalados
```

`npx playwright install chromium webkit` instala navegadores explícitamente si faltan. `APP_URL=https://… npm run test:e2e -- --project=chromium` valida una publicación.

`src/exercises.js` contiene reglas matemáticas; `src/learning-visuals.js` los objetos; `src/audio.js` los canales independientes; `src/app.js` el recorrido mínimo; `src/child.css` el layout ajustado al viewport. Guías y evidencia en `docs/`. Las decisiones históricas anteriores quedan sustituidas por el último apartado de `docs/DECISIONS.md`.
