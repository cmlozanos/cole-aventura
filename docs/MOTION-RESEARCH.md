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
