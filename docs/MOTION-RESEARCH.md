# Investigación de movimiento y juegos JS · 22 noviembre 2026

No hay un framework universal «mejor para niños»: accesibilidad, claridad, feedback y coste de render importan más que la marca. Fuentes oficiales consultadas, no ranking publicitario:

| Candidato | Patrón observado | Encaje |
|---|---|---|
| [Phaser: Tweens](https://docs.phaser.io/phaser/concepts/tweens) | Cambios temporales de escala/opacidad, gestor ligado a escena | Muy bueno para juegos canvas; innecesario sustituir botones DOM accesibles de estas fichas |
| [Phaser: Loader](https://docs.phaser.io/phaser/concepts/loader) | Precarga real antes de iniciar escena, colas de recursos | Adoptar loader de bootstrap real; no introducir espera falsa entre preguntas generadas localmente |
| [PixiJS: ejemplos oficiales](https://pixijs.com/8.x/examples) | Escenas animadas, sprites e interacciones | Motor de render para necesidades gráficas mayores; aquí no hace falta WebGL ni sprites descargados |
| [Motion: animate](https://motion.dev/docs/animate) | Transform/opacity, easing y secuencias | Patrón apropiado a HTML/SVG, puede componerse con Web Animations nativas sin dependencia runtime |
| [GSAP: matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia/) | Adaptar y revertir animaciones cuando cambian condiciones y reduced motion | Adoptar respeto a movimiento reducido y cancelación; no hacen falta plugins de scroll |

Decisión: componer patrones de escena/entrada escalonada/feedback breve, con Web Animations API y fallback instantáneo. No se copia arte, marca ni código de aplicaciones de terceros. No dependencias, licencias nuevas ni CDN. Transform/opacity, no bucle por frame; cancelar al pausar, ocultar o navegar; preferencia reduced-motion y apagado manual. Loader solo mientras se importa realmente el módulo de aplicación, sin porcentajes ficticios. Una transición visual no se presenta como descarga.

PoC incorporada: entrada 260ms, opciones escalonadas 35ms/220ms, respuesta320ms y estrellas850ms, todos acotados y sin afectar geometría. Comprobar navegación, reduced motion, cancelación y no-scroll en los tamaños ya usados. Las fuentes demuestran capacidades de frameworks, no una certificación infantil ni de rendimiento en tablet física.

## Puerta de adultos y transición de ventana completa

Fuentes oficiales adicionales revisadas:
- [YouTube Kids: acceso a configuración mediante multiplicación](https://support.google.com/youtubekids/answer/6292172): se adopta el patrón de reto aleatorio, sin copiar marca ni asumir autenticación fuerte.
- [W3C H102: dialog modal nativo](https://www.w3.org/WAI/WCAG22/Techniques/html/H102): fondo inoperable y foco dentro del diálogo.
- [Material Web: progress indicators](https://github.com/material-components/material-web/blob/main/docs/components/progress.md): indicador indeterminado cuando no hay medición de descarga.

Aplicación: configuración se vuelve a bloquear en cada cierre, apertura nueva genera multiplicación distinta. No es control parental inviolable ni valida edad. El intervalo pedagógico existente tras acierto (3,5s) pasa a un diálogo full-window sin botones ni controles, con estrella, puntos y actividad indeterminada; no se inventa un porcentaje ni se afirma descarga. Se impide Escape y foco en fondo solo durante esa transición corta. Hidden suspende temporizador y reanudar continúa automáticamente; no queda un modal esperando un botón invisible. Reduced-motion y apagado manual afectan animación, no acceso al siguiente reto.
