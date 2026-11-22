# Decisiones y alcance

La petición autoriza diseñar autónomamente esta aplicación y entregarla sin preguntas. Se crea Cole Aventura como proyecto independiente; no se cambian los juegos ni sus perfiles. Cuenta personal verificada: cmlozanos. Entrega: repositorio público independiente, sin datos personales ni texto privado del colegio.

Se han leído README, manifiestos, Makefile y publicación de los juegos existentes (Games, World of Joy y Turbo Loop Legends). Se adopta su enfoque web estática/PWA/GitHub Pages y Playwright 1.62.1. No se reutilizan motores 3D, puertas educativas ni dependencias de juego: no aportan valor a fichas de primaria. HTML, CSS y módulos JavaScript nativos, sin dependencias de ejecución, para tablet y escritorio. No costes de backend, cuentas ni servicios externos.

Cursos españoles de Primaria 1–6 como estructura; solo 1.º tiene contenido inicial y los demás muestran estado vacío honesto. Catálogo por curso/asignatura/actividad, banco separado del motor. Perfiles genéricos locales y progreso aislado. No se publica el nombre de menores, clase, profesora ni comunicación original. Audio opcional del dispositivo, no garantizado offline. Instalación y offline tras primera carga completa.

Primer contenido: Matemáticas, unidades 1 y 2, seis temas, práctica de cinco preguntas y repaso mixto de doce. No se presenta como examen real ni como currículo completo. Sin cronómetro, castigos ni ranking. Respuestas explicadas, apoyo visual y navegación explícita. Fechas no codificadas: el contenido sirve después del examen.

Definición de hecho: tests del generador y persistencia en verde; navegador real cubre temas, errores/reintento, resumen, perfiles, cursos vacíos, móvil, teclado y offline; build reproducible; commit y push verificados. Publicación si GitHub Pages disponible, sin tocar infraestructura ajena. Máximo tres iteraciones de corrección por mismo fallo; cambiar estrategia si no hay avance.
