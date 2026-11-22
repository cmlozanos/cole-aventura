# Decisiones y alcance

La petición autoriza diseñar autónomamente esta aplicación y entregarla sin preguntas. Se crea Cole Aventura como proyecto independiente; no se cambian los juegos ni sus perfiles. Cuenta personal verificada: cmlozanos. Entrega: repositorio público independiente, sin datos personales ni texto privado del colegio.

Se han leído README, manifiestos, Makefile y publicación de los juegos existentes (Games, World of Joy y Turbo Loop Legends). Se adopta su enfoque web estática/PWA/GitHub Pages y Playwright 1.62.1. No se reutilizan motores 3D, puertas educativas ni dependencias de juego: no aportan valor a fichas de primaria. HTML, CSS y módulos JavaScript nativos, sin dependencias de ejecución, para tablet y escritorio. No costes de backend, cuentas ni servicios externos.

Cursos españoles de Primaria 1–6 como estructura; solo 1.º tiene contenido inicial y los demás muestran estado vacío honesto. Catálogo por curso/asignatura/actividad, banco separado del motor. Perfiles genéricos locales y progreso aislado. No se publica el nombre de menores, clase, profesora ni comunicación original. Audio opcional del dispositivo, no garantizado offline. Instalación y offline tras primera carga completa.

Primer contenido: Matemáticas, unidades 1 y 2, seis temas, práctica de cinco preguntas y repaso mixto de doce. No se presenta como examen real ni como currículo completo. Sin cronómetro, castigos ni ranking. Respuestas explicadas, apoyo visual y navegación explícita. Fechas no codificadas: el contenido sirve después del examen.

Definición de hecho: tests del generador y persistencia en verde; navegador real cubre temas, errores/reintento, resumen, perfiles, cursos vacíos, móvil, teclado y offline; build reproducible; commit y push verificados. Publicación si GitHub Pages disponible, sin tocar infraestructura ajena. Máximo tres iteraciones de corrección por mismo fallo; cambiar estrategia si no hay avance.

## Revisión infantil solicitada (22 noviembre)

La nueva petición sustituye el enfoque de catálogo mult curso en la pantalla infantil: solo 1.º de Primaria, inicio directo de seis retos (uno por tema) o juegos individuales de cinco. Se conserva el modelo extensible y el progreso anterior. Se elimina el doble paso elegir/comprobar: tocar respuesta comprueba inmediatamente; un error nunca avanza. Tras acierto, explicación visual y avance automático con pausa y botón de siguiente. Se pausa al ocultar la app y se cancelan temporizadores al salir/cambiar perfil. La voz se inicia tras pulsar jugar (restricciones navegador), con repetición y silencio; no se exige audio para jugar. No se promete voz offline.

Cantidades y operaciones usan pegatinas SVG contables; suma muestra grupos, resta objetos tachados y comparación cantidades. Pista muestra recta numérica. Los botones de respuesta incluyen cantidad visual, salvo nombres de figuras. Contadores adultos y comparativas se trasladan a zona familiar; final infantil celebra preguntas practicadas, no velocidad ni nota. Paleta y objetivos táctiles adaptados a niños; sin dependencia gráfica externa.

## Simplificación solicitada: pantalla única y silencio inicial

Se elimina navegación, portada, selector de tema, perfiles visibles, resumen y modo familia. La aplicación abre directamente un reto generado al vuelo y continúa con otro tema aleatorio al resolverlo. No hay una ficha ni una sesión prefijada. Preguntas, cantidades, orden de respuestas, inclinación de figuras y acento de objetos se generan aleatoriamente dentro de reglas matemáticas de primero; las reglas y consignas son necesariamente código, no una promesa de contenido generado por IA. Tres controles de icono con nombre accesible: pausa, voz y efectos. Ambos audios siempre apagados al cargar, sin recuperar preferencias anteriores. Cada canal se activa/desactiva independientemente.

No se borran datos antiguos del navegador; la nueva interfaz no los utiliza ni escribe progreso. Se mantiene el módulo de almacenamiento para compatibilidad/futura evolución, sin acceso desde app.js. No-scroll se valida midiendo viewport y geometría visible, sin ocultar desbordamientos con overflow:hidden. La presentación se adapta a orientación horizontal corta. Tocar respuesta comprueba; error mantiene pregunta y muestra ayuda, acierto avanza. Pausa detiene transición y ambos audios; ocultar aplicación pausa el juego.

## Inicio, movimiento y puntos (petición posterior vigente)

Se reintroduce Inicio por petición expresa, con todos los juegos abiertos y modo sorpresa. Puntos generales siempre visibles: un punto por reto resuelto, sin castigos, una sola vez; misma sesión entre juegos/recargas y cero tras más de una hora de inactividad de juego. Offline no equivale a inactividad. localStorage principal, cookie funcional scoped como fallback, memoria si no hay persistencia. No se renombran ni borran datos históricos. Opciones manuales: continuar, otro reto, reiniciar puntos con confirmación y desactivar animación. Audio sigue inicialmente apagado e independiente.

Investigación y comparación oficial en MOTION-RESEARCH.md. Se adoptan entradas, escalonado y feedback de patrones de motores, no se incorpora un canvas ni librerías innecesarias a la UI accesible. Loader real en importación, no porcentajes/esperas inventados. Animaciones cancelables y reduced-motion. Presupuesto de pruebas por alcance: sesión pura con reloj inyectado, movimiento, browser de inicio/puntos/audio/no-scroll/offline; no suites ajenas.

## Menos opciones infantiles y puerta de adultos (petición posterior)

Cabecera infantil: Inicio, pausa y acceso Adultos; voz/efectos/animaciones/reinicio/cambio manual de reto quedan detrás de multiplicación aleatoria2–9, nueva en cada apertura. Se elimina explicación de puntos/expiración y botones duplicados de continuar/cerrar: cierre es icono y reanudar sigue en cabecera. Puerta se bloquea al cerrar, también Escape. Se conservan nombres accesibles y error necesario, consignas de aprendizaje y avisos de fallo. No se presenta esta puerta local como autenticación o control parental fuerte.

Tras acierto el tiempo existente hasta siguiente reto queda cubierto inmediatamente por dialog nativo de ventana completa, sin interacción; puntos visibles dentro del modal. No se puede pulsar controles de fondo ni cerrar con Escape/Tab/Enter. Los errores no abren loader. Al ocultar se detiene temporizador; al volver continúa automáticamente. Las fuentes y distinción entre transición y carga real están en MOTION-RESEARCH.md.

## Menos lectura, sin pausa y sorpresa automática (petición posterior)

Cabecera queda solo Inicio y Adultos. No hay botón ni texto «Pausa». Suspensión interna solo mientras documento oculto o diálogo adulto, con reanudación automática al volver/cerrar (también BFCache). La aplicación abre directamente el modo Sorpresa, que elige un tema diferente del anterior; Inicio conserva todos los temas y Sorpresa disponibles. Consignas reducidas a «¿Cuántos?», comparación corta y operación simbólica; problemas conservan acción y pregunta mínimas. Feedback visual ✓/↻ y ayuda gráfica en vez de más párrafos; voz opcional de acierto breve.

Transición modal650ms en vez de3500ms (81% menos), sin añadir mínimo al loader de importación. Silencio inicial, puntos, expiración, no-scroll y puerta adulta se mantienen. No se recargan documentos globales ni se ejecutan suites ajenas: lectura dirigida de app/generador y tests afectados.

## Día/noche y alfabetización (petición posterior)

Se añaden Día/Noche/Sistema en configuración adulta, automático inicial del sistema y elección persistida; no se incorporan botones extras infantiles. Nueva CSS semántica cubre superficies, controles, estados, transición, puerta y bootstrap en ambos temas. Investigación oficial de fuentes y sílabas en READING-THEME-RESEARCH.md. Playwrite ES para lectura/consigna escolar española, Andika para controles y alternativa de imprenta; no se afirma coincidencia con todos los colegios. Fuentes OFL originales locales, licencias y precaché sin CDN.

Cuentos queda disponible en Inicio, separado del modo Sorpresa matemático para no alterar el temario ya probado. 64 combinaciones de personaje/objeto/lugar, tres frases breves paginadas, avance manual y comprensión final que suma un punto; nada de certificar lectura por tocar palabras. Palabras completas con sílabas revisadas, color+subrayado diferente sin introducir underscores en pronunciación. Tap pronuncia solo si adulto activó Voz; si no, resalta y muestra mute. Silencio al cargar, no-scroll y puerta adulta siguen vigentes. No se divide automáticamente texto arbitrario y no se graba voz.

## Aspecto público (corrección expresa)

Día/Noche/Sistema deja de ser ajuste adulto. Se mueve a selector nativo compacto siempre disponible en cabecera, con nombre accesible Aspecto y los tres estados explícitos. No añade diálogo ni multiplicación, no cambia pregunta/puntos/audio. Letra y resto de controles permanecen protegidos. Se mantiene persistencia y seguimiento del sistema del módulo probado. Alcance mínimo: controlador/CSS/tests de consumidores de tema; no modificar modelos de lectura/sesión.
