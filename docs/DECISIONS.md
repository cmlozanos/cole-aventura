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
