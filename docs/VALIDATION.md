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

## Revisión infantil de 1.º (misma fecha, posterior a la entrega inicial)

Se sustituyen portada de catálogo, doble confirmación de respuesta y ejercicios abstractos por inicio de un toque, seis juegos de primero, comprobación inmediata y representaciones SVG manipulables. Voz automática tras gesto inicial con silencio y repetición; errores conservan pregunta; aciertos avanzan después de explicación con pausa y avance manual. Ocultar la app pausa la transición; salir cancela temporizadores. El resumen infantil no compara aciertos, que siguen en zona familiar. En figuras se escucha/lee el nombre y se elige entre dibujos (ya no requiere leer cuatro nombres como respuesta). La pista aporta modelo de figura. Datos previos conservados y nuevos archivos incluidos en precaché.

Verificaciones específicas: 39 tests puros (21 modelo/persistencia y 18 de representación visual), incluidos límites 0 y 10 y todas las combinaciones válidas de operaciones; navegador: nueve recorridos por motor Chromium/WebKit (18 ejecuciones), conservando negativos de error, almacenamiento bloqueado, aislamiento, teclado y offline Chromium. Nuevas guardas: respuesta en un toque, pausa/avance automático, no avance ante error, cancelación al salir, voz silenciable con API simulada (no certificación de voz real), ausencia de API de voz y conservación de contadores marcados al pedir ayuda. Se corrigió además una etiqueta SVG que antes interpolaba literalmente una variable. Capturas móviles de portada/resta y figuras y tablet en `docs/evidence/child-*.png`. Pendientes: tablet física, revisión docente, lector humano y offline real WebKit como ya se documentó.

## Pantalla única y controles mínimos (revisión posterior)

Se elimina todo flujo secundario, sustituido por pregunta aleatoria al cargar y al acertar. No existe botón de inicio, selección de tema, familia, perfiles ni resumen. Tres botones globales de icono con nombre accesible y estado: pausa, voz y efectos. Voz/efectos apagados en cada carga. Audio Web usa contexto lazy, tonos breves y canales independientes, con cancelación al desactivar/pausar y manejo de rechazo. No se borran ni migran datos anteriores.

50 tests puros: modelo/persistencia conservados, renderizadores y 11 pruebas focales de audio con mocks; defaults silenciosos, independencia y carreras de resume/mute. Pruebas browser verifican ausencia de menús, silencio por defecto sin crear AudioContext, interruptores independientes, recarga silenciosa, error/reintento, transición, pausa, offline Chromium y conservación de almacenamiento anterior. Layout medido a 320×568, 360×640, 768×1024, 1024×768 y 667×375, incluyendo ayudas, todos los temas y casos extremos 10+0/10−10, comparación10/9 y conteo10. Se comparan scrollHeight/Width con viewport y cajas visuales con contenedor: no se usa overflow:hidden para aparentar que cabe. Capturas `simple-mobile.png` y `simple-landscape.png` revisadas.

El test de recorrido completo se amplió a 120s porque avanza por temporizadores reales de 3,5s; la primera ejecución agotó el timeout estándar de 30s, no por desbordamiento. Audio probado con API simulada, no altavoz físico; voces offline y WebKit offline conservan los límites ya registrados. Aleatoriedad acotada al temario y plantillas lingüísticas, no contenido IA ilimitado.

Autoevaluación de esta revisión: exactitud4/5 (modelo/audio y layout medidos; no dispositivo físico), completitud4/5 (flujo mínimo requerido sin contenido ilimitado), claridad4/5 (iconos con etiquetas accesibles), accionabilidad5/5 (PWA autónoma), concisión5/5 (solo pregunta y controles indispensables).

Resultado final de esta revisión: `npm run check` **50/50** y build; `npm run test:e2e` **12/12** (seis recorridos por motor) en verde. Duración del recorrido de layout explicada por esperas reales, no espera arbitraria ocultando carga. No se ejecutaron suites de otros juegos.

## Inicio, puntos y animaciones (revisión posterior)

Investigación oficial y decisión en `MOTION-RESEARCH.md`: Phaser/PixiJS como motores, Motion/GSAP como animación DOM. Se adoptan patrones con Web Animations nativas y se mantiene el DOM accesible sin nuevas dependencias. Loader real mediante import dinámico, manejo de fallo y reintento; transiciones/estrellas acotadas, canceladas al navegar/pausar/ocultar y anuladas por reduced-motion o interruptor manual.

77 tests puros: límites matemáticos, visuales, audio previos +25 de sesión y2 de movimiento. Reloj inyectado verifica exactamente1h, >1h, recarga, lectura sin actividad, interacción real, corrupción, rollback de reloj, fallback cookie/memoria, reset manual, deduplicación y reconciliación secuencial entre dos instancias. No se afirma atomicidad entre dos pestañas simultáneas.

Browser conserva guardas audio/silencio, error/reintento, avance/pausa, offline Chromium y datos históricos. Nuevos casos: Inicio y siete juegos habilitados, punto único, persistencia y reinicio manual con confirmación, reset >1h, reduced-motion, cookie real con localStorage bloqueado, loader mientras descarga módulo y reintento al fallar. Viewports320×568,360×640,667×375,768×1024 y1024×768, incluidos casos extremos y Opciones. Se corrigió un desplazamiento de8px en animación de raíz que generaba scroll temporal: raíz ahora anima solo opacidad y opciones escalan hacia dentro. Dos regresiones focales volvieron a verde tras corregirlo.

Capturas `session-home-mobile.png`, `session-game-mobile.png`, `session-options-mobile.png`, `session-options-landscape.png` revisadas. No descargas externas durante juego; caché incluye nuevos módulos. No validación de altavoz físico, lector humano, instalación nativa o GPU de tablet. Autoevaluación4/5 exactitud/completitud/claridad;5/5 accionabilidad;4/5 concisión (acciones manuales agrupadas en Opciones).

Resultado final: `npm run check`77/77 y build en verde; `npm run test:e2e`22/22 (11 por motor) en verde. Sin suites de otros proyectos. La comparación de capacidad con frameworks no sustituye una medición física de tablet.

## Puerta de adultos y transición modal (revisión posterior)

Fuentes oficiales YouTube Kids/W3C/Material revisadas y enlazadas en MOTION-RESEARCH.md. La configuración queda detrás de multiplicación2–9; cada apertura cambia el reto, error no accede, cierre/Escape vuelven a bloquear. No se guarda respuesta ni desbloqueo en cookies. Tres controles infantiles en cabecera; audio apagado por defecto permanece. Textos sobre puntos/expiración/continuar y subcabecera de relleno retirados. Se conservan consignas/pistas, errores necesarios y nombres accesibles.

Transición postacierto: dialog nativo full-window de3,5s, sin botones/input, fondo inoperable y Escape/Tab/Enter sin efecto; puntos replicados en overlay, no segundo cómputo. Error nunca abre modal; transición no renueva actividad ni puntúa otra vez. Al ocultar se suspende el avance y al volver se reanuda automáticamente. Se preservan reduced-motion y apagado de animación manual. El tiempo es transición pedagógica ya existente, no se presenta como descarga.

Resultado de esta revisión:84/84 tests puros y build;14 casos Chromium (12+2 focales) y14 WebKit en verde. Se comprueban multiplicación errónea/correcta, re-bloqueo al cerrar/Escape, renovación del reto, ausencia de párrafos retirados, configuración y entrada en320×568/667×375, transición modal full-viewport sin controles, teclado sin cierre, puntos únicos, salida automática y reduced-motion. Mantiene límites históricos de tablet física/voz/WebKit offline. Autoevaluación4/5 exactitud/completitud/claridad,5/5 accionabilidad,5/5 concisión infantil.

## Recorrido rápido y sin pausa (revisión posterior)

Se retira control/texto Pausa y se conserva suspensión solo interna con autorreanudación al cerrar Adultos, volver visible o pageshow persistido. Sorpresa inicia automáticamente con temas distintos consecutivos. Se acortan consignas/feedback y transición3500→650ms; voz de acierto breve evita cancelar explicaciones largas. Negativos conservados: error no avanza, settings siguen bloqueados, puntos únicos/persistencia/expiración, audios apagados y loader modal sin interacción.

Pruebas browser nuevas: dos iconos, sin botón pausa, arranque directo sin selección, tres transiciones reales <1,6s cada una con timeout1,8s, temas diferentes, cierre Adultos y visibilitychange que reactivan respuestas. El test de carga conserva espera real con contenido accesible no visible. Modelo/generador mantiene pruebas vigentes. No sustituye medición de tablet física.

Resultado final84/84 tests puros+build y34/34 browser (17 por motor), con servidor estable explícito4180. Un intento concurrente anterior compartió servidor4173 que finalizó con el otro proceso y produjo connection refused; se descartó esa evidencia y se repitió secuencialmente sobre4180, sin cambiar expectativas. Captura fast-mobile.png revisada. Autoevaluación4/5 exactitud/completitud (no tablet física),5/5 concisión infantil y accionabilidad.

## Día/noche, fuentes y cuentos (revisión posterior)

Investigación verificable en READING-THEME-RESEARCH.md. Fuentes locales Playwrite ES338740bytes y Andika669828bytes, originales sin transformar, licencias OFL incluidas. Agente verificó glifos españoles áéíóúüñ/¿¡ y hashes; navegador comprueba carga real. No instalación global ni CDN. Playwrite ES se basa en modelos de enseñanza manuscrita de España, no se afirma fuente universal ni efecto terapéutico. Alternativa Andika de imprenta en Adultos.

97 tests puros (84previos+8tema+5lectura). Generador lectura verificado en4096semillas y64combinaciones exhaustivas; tokens/segmentos reconstruyen palabra con puntuación/tildes correctas. Sin división automática arbitraria. Temas: default sistema, cambios vivos, manual persistente, almacenamiento bloqueado, fallback y limpieza listener.

Browser: temas sistema/día/noche y persistencia, fuente Escolar/Imprenta, fuentes en caché, cuentos tres páginas sin prisa, audio inicialmente0, palabra pronuncia tras activar Voz, pregunta de comprensión y punto único, nuevo cuento, modo oscuro y contraste de iconos medido, fuentes/contenido offline Chromium. Layout con fuentes cargadas a320×568/667×375/768×1024 y diálogos adulto. Capturas reading-*.png inspeccionadas; no revisión docente/lector humano ni voces reales en tablet física. Separación por sílabas solo en vocabulario de cuentos, no todos los textos arbitrarios. Fuentes SVG/números no se alteran ni se sacrifican objetivos táctiles.

Resultado:97/97 tests puros+build y40/40 recorridos completos Chromium/WebKit en verde. Tras ajuste final de barajado de respuestas de cuento, se repitieron5focales Chromium y4WebKit;1caso de offline WebKit se omite explícitamente por limitación nativa documentada. Offline real de cuentos/fuentes comprobado en Chromium. Contraste texto/control medido >4,5:1 en ambos temas (no certificación WCAG completa). Autoevaluación4/5 exactitud/completitud (pendiente docente/tablet/voz real),5/5 accionabilidad,4/5 claridad y concisión (controles nuevos permanecen en Adultos).

## Aspecto público

Cambio de acceso únicamente: selector nativo en cabecera para Día/Noche/Sistema, retirado de Adultos. Tests focales de tema público, persistencia, seguimiento sistema, configuración aún protegida y layout320×568/667×375 en ambos motores. No se repite suite global browser porque no cambian ejercicios/sesión/audio. Se reutilizan sus evidencias vigentes. Modelo/build verificado por check del proyecto. Evidencia public-theme-*.txt.

## Fuente ligada transversal

Inventario de consumidores reales: child.css/reading.css, controles nativos, etiquetas home, lectura, cifras/score, diálogos, loader/bootstrap y texto SVG. Playwrite ES única en todas las superficies con font-synthesis:none, sin selector alternativo. Regresión DOM comprueba fontFamily calculado de todos los nodos con texto en ejercicio/inicio/puerta/settings/cuento, incluso habiendo preferencia histórica print. Se revalidan layouts porque la letra ligada tiene métricas distintas; conservar no-scroll sin ocultar contenido.

Resultados:97 tests puros/build verdes; suite browser46 verdes+1omitido (offline WebKit conocido) y1fallo de serialización CSS del propio test (WebKit devuelve nombre de familia sin comillas). Se normalizó solo las comillas de fontFamily; regresión focal2/2 en ambos motores verde. El layout y resto de recorridos no cambió tras ese ajuste de test. Capturas linked-font-home/mobile revisadas. No se modifican licencias/fuentes originales ni datos previos.

## Sílabas transversales discretas

177 palabras explícitas revisadas, sin inferir sílaba tónica. Se aplica en renders/mensajes/ajustes/fallback, excluyendo iconos, cifras, inputs y atributos. Cuentos y resto de UI conservan **un solo nodo de texto por palabra**, sin separar letras, espacios/guiones ni spans por sílaba: solo subrayado fino segmentado, en el mismo color que el texto. Sin movimiento, cambios de tamaño ni alternancia cromática de letras. Se conserva ligada continua, tildes, puntuación, voz y nombre accesible completo.

La primera integración detectó dos fallos: MutationObserver reescribía textos no decorables (se limitó a vocabulario conocido), y nodos inline alteraban espacios del nombre accesible alrededor de signos (se fija nombre original completo, actualizando solo etiquetas gestionadas por decorador). Confirmación de reset ahora ocurre dentro de la app en dos pasos, sin confirm nativo que no admite marcado; no cambia el reset hasta segundo toque. Aspecto nativo solo iconos con nombres accesibles porque option no admite estilo silábico portable.

105 tests puros/build en verde, 12 regresiones browser focales verdes en Chromium/WebKit: cobertura del vocabulario generado, todos los menús/temas/puerta/settings/cuento, no duplicación del marcado, palabra sin fragmentar, fuente ligada, confirmación y no-scroll. Capturas syllables-discreet-home/story revisadas. Subrayado segmentado es apoyo visual discreto, no certificación pedagógica ni análisis tónico; revisión docente pendiente. Evidencia final de suite completa aparte.

Resultado final:105/105 puros+build;51browser verdes y1omitido explícito (offline WebKit ya documentado). Sin fallos finales. No se ejecutan suites de otros repositorios. Autoevaluación4/5 exactitud/completitud (vocabulario acotado, revisión docente pendiente),5/5 concisión/accionabilidad y4/5 claridad. La segmentación gráfica no implica acentuación tónica.
