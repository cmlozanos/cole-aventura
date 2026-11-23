# Cole Aventura

[**Abrir la aplicación**](https://cmlozanos.github.io/cole-aventura/)

Matemáticas visuales para **1.º de Primaria**, sin anuncios ni cuentas. En Inicio están todos los juegos disponibles, sin bloqueos: números1–10, mayor/menor, sumas hasta10, restas sin negativos, problemas de una operación y figuras. «¡Sorpresa!» mezcla temas. Las preguntas se generan al vuelo y las respuestas se barajan; no hay fichas fijas.

## Jugar y puntos

Toca objetos para contar y elige una respuesta. Los errores muestran ayuda sin penalizar; resolver cada reto suma **1 punto**, una sola vez, incluso tras reintentos. El total se ve siempre en la cabecera, también al cambiar de juego o volver a Inicio.

La sesión conserva puntos al recargar/cerrar y volver a abrir. Si pasan **más de 60 minutos sin interacción de juego**, empieza una sesión a cero al regresar. Exactamente60 minutos no reinicia. Se mide actividad real (iniciar, responder, contar o continuar), no conexión a internet ni temporizadores de fondo. Estar offline no quita puntos si se sigue jugando. No se necesita cuenta ni se manda información a un servidor.

Persistencia: localStorage; si está bloqueado, cookie funcional limitada a la ruta de la app (`SameSite=Lax`, `Secure` en HTTPS); si ambos fallan, memoria temporal. El almacenamiento del navegador puede borrar datos y no hay sincronización entre dispositivos. Las pestañas se reconcilian secuencialmente, sin garantía transaccional si se responde simultáneamente en dos pestañas.

## Controles

Iconos infantiles de **Inicio**, **pausa** y **Adultos**. La voz y los efectos están dentro de la configuración protegida. Los dos audios siempre empiezan apagados al cargar y se controlan independientemente. La voz depende del dispositivo y no se garantiza offline.

Tras resolver la multiplicación de Adultos se puede cambiar de reto, reiniciar puntos con confirmación y controlar audio/animaciones. Pausar, ocultar o salir detiene sonidos y movimiento. Cambiar juego no borra puntos. No se borran datos históricos de versiones anteriores.

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

## Simplificación infantil vigente

La cabecera infantil muestra solo Inicio, pausa y acceso Adultos. **Voz, efectos y configuración ya no se exponen al niño**: cada apertura exige una multiplicación aleatoria. Al cerrar se bloquea de nuevo; no se guarda un acceso desbloqueado. Es una barrera local de uso, no una verificación de edad ni autenticación fuerte.

Se retiran textos explicativos y acciones redundantes del diálogo. Tras acertar, el intervalo hasta siguiente reto ocupa toda la ventana con una celebración/indicador sin botones, sin interacción ni cierre por Escape; los puntos siguen visibles. No es una descarga simulada ni muestra porcentajes. Se cierra automáticamente al llegar el siguiente reto. Las consignas y pistas didácticas se conservan.

### Recorrido rápido vigente

La app abre directamente **Sorpresa**, alternando tipos de ejercicio sin repetir tema seguido. Cabecera: solo Inicio y Adultos; se retira pausa. Cerrar Adultos o volver a la app reanuda automáticamente. Consignas y feedback más breves, con operación simbólica y ayuda visual. La transición de acierto dura **650ms** (antes3,5s); el loader inicial solo espera la carga real, sin demora añadida.

## Día/noche y lectura

En el selector **Aspecto de la cabecera**, sin entrar en Adultos: ☀ Día, ☾ Noche o ◐ Sistema (predeterminado). La elección se guarda; Sistema sigue cambios del dispositivo. El tema cubre ejercicios, cuentos, controles y diálogos.

**Adultos → Letra** permite Escolar (**Playwrite ES**, modelo manuscrito de España investigado por Primarium) o Imprenta (**Andika**, diseñada para alfabetización). No hay una tipografía única de todos los colegios: elegir la que coincida con el material de clase. Ambas se sirven localmente bajo SIL OFL y funcionan offline tras caché; no se descarga nada de Google durante el juego. Fuentes y límites en `docs/READING-THEME-RESEARCH.md`.

**Inicio → Cuentos**: minicuentos aleatorios de tres páginas, con64 combinaciones locales y pregunta final. Palabras pulsables, sílabas en colores y subrayado sólido/punteado. Las sílabas están revisadas en el vocabulario de cuentos, no se adivinan para cualquier texto. La palabra se pronuncia completa (sin guiones) solo si un adulto ha activado Voz; por defecto sigue silenciada. Puede requerir una voz española instalada/conexión según navegador. No hay reconocimiento ni grabación de voz. Avance manual para leer sin prisa; acertar comprensión suma un punto, tocar palabras no.

El aspecto es accesible para todos. El selector Día/Noche/Sistema no pide multiplicación ni cambia el ejercicio o los puntos; solo los demás ajustes permanecen protegidos.

### Tipografía única vigente
Toda la interfaz usa **Playwrite ES**, la misma letra ligada de «Elige tu aventura»: botones, cuentos, ajustes, puntos y mensajes. Se retira la alternativa de imprenta. La fuente se precarga desde la propia app y sigue disponible offline. El aspecto Día/Noche/Sistema continúa en cabecera, accesible para todos.

### Sílabas en toda la app

Menús, botones, consignas, ajustes, errores y cuentos comparten un subrayado silábico fino, del mismo color que el texto. Se conservan palabras, tildes y puntuación completas para voz y accesibilidad. No se añaden guiones ni underscores al texto. El vocabulario actual se segmenta explícitamente y se valida; no se afirma resolver cualquier palabra externa automáticamente. El selector de aspecto usa iconos para evitar texto nativo que no puede colorearse por sílabas. Reiniciar puntos requiere dos toques: solicitar y confirmar.

Las palabras no se fragmentan: mantienen un único texto y su letra ligada continua, sin colores alternos ni animaciones por letras.

### Tablets antiguas (Galaxy Tab4)

Ajuste de altura visible para Chrome95, barras y teclado, sin depender de100dvh. Inicio y cabecera adaptados a orientación/anchura efectiva; no se esconden controles con overflow. Títulos con iconos SVG por actividad. `make test-tab4 CHROME95_PATH=/ruta/a/Chromium95` ejecuta regresión específica sin descargar navegador. Investigación y alcance en `docs/GALAXY-TAB4.md`: motor95 real comprobado en escritorio; instalación/GPU/barras de la tablet física requieren confirmación en el dispositivo.

### Consignas sin ambigüedad

Los títulos ya no llevan iconos decorativos: una resta muestra únicamente su operación, sin un signo adicional delante. Las formas solo aparecen como respuestas o ayuda del ejercicio, no como figuras añadidas junto a la pregunta. Se conservan los dibujos que representan cantidades y acciones.
