# Cole Aventura

Una PWA de práctica escolar por cursos de Educación Primaria española. Sesiones cortas, explicaciones amables y progreso independiente para hasta seis exploradores, sin cuentas ni nombres reales.

## Primer pack

**1.º de Primaria · Matemáticas · Unidades 1 y 2**

- Contar cantidades del 1 al 10.
- Distinguir el mayor y el menor.
- Sumar hasta 10 y restar sin resultados negativos, incluido el cero.
- Resolver problemas breves de una operación.
- Reconocer círculo, cuadrado, rectángulo y triángulo.

Cada tema ofrece cinco preguntas aleatorias. «Repasar todo» combina doce, dos por tema. Las respuestas se comprueban antes de avanzar; los errores permiten reintentar con una pista. El resumen distingue aciertos independientes de preguntas resueltas con ayuda. No hay cronómetro, notas oficiales ni rankings. Los cursos de 2.º a 6.º ya tienen su espacio, pero no se inventa contenido para ellos.

## Usar e instalar

[Abrir Cole Aventura](https://cmlozanos.github.io/cole-aventura/)

Funciona en el navegador sin instalación. En Android: menú → Instalar aplicación. En iPhone/iPad: Compartir → Añadir a pantalla de inicio. Tras abrirla con conexión, esperar a «Lista sin conexión» antes de desconectarse. La lectura opcional usa la voz del dispositivo y no está garantizada sin conexión.

Los perfiles son genéricos: «Explorador 1», «Explorador 2», etc. Se eligen en la cabecera. El avance se guarda únicamente en este navegador; no se sincroniza y se pierde al borrar los datos del sitio. Si el almacenamiento está bloqueado, se puede practicar y aparece un aviso al intentar guardar. La zona familiar muestra el progreso, sugerencias e instalación; no es un control parental protegido.

## Desarrollo

Node.js 20+, npm y Python 3 para el servidor estático. Sin dependencias de ejecución ni CDN. Makefile propio; `make` muestra ayuda.

```sh
make install           # npm ci --ignore-scripts; solo herramientas de prueba
make check             # tests puros + build estático
make run               # http://127.0.0.1:4173
make test-browser      # Chromium y WebKit, si están instalados
```

Si faltan navegadores de Playwright, instalarlos explícitamente con `npx playwright install chromium webkit`. No se descargan como efecto de `make install`. `APP_URL=https://… npm run test:e2e -- --project=chromium` permite validar un despliegue. El build copia un inventario explícito de archivos a `dist/`, calcula la versión del caché desde sus bytes y genera el service worker. No borra otras rutas ni cachés de otros juegos.

## Añadir actividades

Consultar [la guía de contenido](docs/CONTENT.md), [las decisiones](docs/DECISIONS.md) y [la evidencia](docs/VALIDATION.md). Catálogo y preguntas están separados de la UI; no se almacena ni publica la comunicación privada del colegio. La primera versión incorpora un único pack: añadir otro requiere datos, generador y pruebas; el selector de actividad aparece si hay varios packs (no hay un editor automático de mensajes).

## Privacidad y límites

Sin analítica, publicidad, backend ni subida de progreso. El alojamiento puede registrar solicitudes HTTP conforme a su política. No se publican datos de menores. No es un currículo completo, evaluación oficial ni reproducción del examen del colegio. Falta validación docente del banco y prueba en la tablet física. Offline y responsive se comprueban en navegadores de escritorio, no acreditan instalación nativa en todos los dispositivos.
