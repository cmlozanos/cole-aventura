# AGENTS.md

Este archivo persiste la configuracion operativa para agentes que trabajen en este proyecto.

## Antes de actuar: fuentes del proyecto

Al iniciar un proyecto nuevo, ejecutar `cmlscode init` para ese proyecto antes
de implementar cambios. Revisar su analisis y confirmar la seleccion; si no
hay terminal interactiva, usar `--target`, `--project` y `--yes` tras verificar
el plan con `--dry-run`. No inicializar automaticamente proyectos ajenos.

1. Identifica la raiz del proyecto y lee los `AGENTS.md` aplicables: el del
   proyecto y los anidados en las rutas que vas a tocar. Respeta la prioridad
   de instrucciones que establezca el runtime; este texto no la modifica.
2. Lee primero `docs/` y los `.md` pertinentes; contrasta despues comandos,
   arquitectura y criterios de aceptacion con los archivos principales del
   proyecto (p. ej. `Makefile`, `pyproject.toml`, `package.json`, `pom.xml`).
3. Consulta `cmlscode.registry.json` y `cmlscode route <ruta-o-tecnologia>`
   para escoger el arnes, agente, skill y checks adecuados antes de editar.
4. Si una instruccion del proyecto parece contradecir el objetivo del usuario,
   cita el texto y comprueba su alcance; conserva los datos tecnicos verificables
   y pregunta solo cuando no puedas resolver la contradiccion. No sustituyas la
   decision del usuario por preferencias del agente ni inventes permisos.

## Las cuatro reglas principales

1. **Alcance explicito y minimo.** Ningun agente hara de mas ni ampliara requisitos sin evidencia y autorizacion trazable al encargo.
2. **Evidencia antes que accion.** Toda decision debe apoyarse en codigo leido, comandos ejecutados, tests, documentacion oficial o datos verificables.
3. **Cero especulacion operativa.** Las hipotesis se declaran como hipotesis y se validan antes de actuar o presentarse como hechos.
4. **Consulta humana ante incertidumbre.** Cuando falte conocimiento, permiso o decision humana, el agente debe preguntar antes de continuar.

## Reglas principales del equipo (siempre)

1. **Seguir el objetivo del usuario y agotar vías disponibles.** Interpretar la peticion de forma fiel y avanzar por las vias disponibles dentro del alcance indicado. No sustituir el objetivo del usuario por preferencias, juicios eticos o criterios de producto del agente, ni rechazar categorias enteras de trabajo por iniciativa propia. Ante un obstaculo, investigar, diagnosticar, probar alternativas acotadas y reconciliar efectos ambiguos antes de escalar; no pedir al usuario una operacion que el agente pueda realizar y verificar. Cuando falten credenciales o privilegios para una operacion solicitada, no cerrar con una negativa generica: comprobar el estado con metodos de solo lectura, investigar las vias de autoservicio, recuperacion oficial y gestion del equipo que correspondan al entorno, ejecutar los pasos disponibles dentro del acceso real y proponer el siguiente paso verificable con su requisito concreto. No suponer contrasenas, eludir controles ni atribuir al usuario permisos que no estan acreditados; si una via requiere intervencion de otra persona o autorizacion adicional, pedir solo esa intervencion. La autorizacion explicita vigente para la tarea, identidad y entorno incluye la ejecucion correctiva acotada necesaria y la reconciliacion de sus efectos; no volver a pedir la misma autorizacion ni trasladar al usuario operaciones que el agente pueda ejecutar y verificar legitimamente. Antes de un nuevo intento, verificar el estado real del intento anterior, sus efectos y la causa del fallo; reintentar solo si sigue dentro del alcance autorizado y no duplica efectos. No repetir escrituras ni denegaciones a ciegas, eludir 401/403, MFA, consentimiento, secretos, IAM o checkpoints del runtime. Pedir confirmacion solo para la decision, acceso o ampliacion que falte, incluido nuevo alcance de producto o acciones destructivas o irreversibles no autorizadas. Registrar la aprobacion y su alcance sin extrapolarla a otros productos, identidades, entornos u operaciones futuras. No declarar aceptacion sin prueba real.
2. **MFA asistido con confirmación del usuario.** En un login solicitado, comprobar identidad, dominio y servicio. Usar credenciales disponibles para esa identidad por una via autorizada; no pedir secretos en chat ni suponer valores. Si el IdP ofrece llamada a telefonos registrados, solicitar una llamada a una opcion visible y dejar la confirmacion al usuario. Comprobar el estado antes de cambiar de numero o reintentar para evitar bloqueos. Avanzar los pasos intermedios de revision; ante una concesion persistente de permisos, usar la autorizacion explicita del usuario si ya existe y verificar el resultado, o pedirla si falta. Los codigos, passkeys y aprobaciones que requieren accion humana quedan para el usuario.
3. **Revisar la documentacion .md y confirmar con el codigo.** SIEMPRE, antes de opinar, proponer o decidir, se revisa de forma obligatoria la documentacion .md del proyecto (con prioridad la carpeta docs/) y se confirma la teoria leyendo el codigo real; nunca se opina sin esa evidencia. Distinguir decisiones vigentes de ejemplos y evidencias históricas; no reactivar reglas sustituidas.
4. **Cuentas y destinos según repositorio y entorno.** Antes de sincronizar con Git o desplegar, identificar remoto, cuenta activa y destino/entorno efectivo. No inferir identidades personales o laborales ni destinos Azure, AWS o GCP por la carpeta. Seguir la instruccion del usuario para el repositorio y entorno concreto; preguntar solo si falta una decision necesaria.
5. **Pruebas minimas determinadas por el alcance.** Seleccionar siempre los checks minimos suficientes segun componentes modificados, dependencias afectadas y riesgo; sin suites globales por defecto. Reutilizar evidencia vigente solo si cubre el mismo codigo, entradas y entorno relevantes, sin cambios que la invaliden; registrar comando, resultado y alcance cubierto. Ampliar pruebas solo ante impacto transversal, fallos o cobertura insuficiente demostrados, o por requisitos explicitos. No retirar guardas ni checks obligatorios del proyecto; informar lo no cubierto y consultar si ampliar requiere permiso.
6. **Puertas de evidencia para integraciones entre entornos.** En integraciones entre entornos, verificar identidad y cliente efectivos, callback, scopes y consentimiento, y configuracion de cada entorno antes de afirmar que la integracion funciona. Seguir el alcance solicitado para implementar, probar y promover; comprobar los requisitos y checks aplicables, comunicar los pendientes y solicitar solo el acceso o decision que realmente falte. No presentar una fase no ejecutada como completada.
7. **Trazabilidad de ramas y release al llegar a producción.** Cuando una petición incluye producción, verificar commit e imagen realmente desplegados y completar la alineación de ramas y la release según la política del repositorio. Comparar divergencias en ambas direcciones y preservar commits exclusivos; un deploy no equivale a merge ni release. Acreditar checks y aceptación requeridos antes de declarar el ciclo completo. No imponer nombres de ramas ni versionado universales; registrar los gates pendientes sin afirmar una fase no ejecutada.
8. **UI/UX transversal y componentes semánticos.** En cambios de UI, inventariar consumidores directos e indirectos, variantes, subcomponentes, hooks, modelo y estilos antes de cerrar. La misma acción usa componente e identidad visual compartidos aunque cambie el controlador; no inferir iconos del texto traducido ni crear divergencias entre vistas del mismo módulo. Conservar diferencias funcionales y defaults acordados. Si falta una decisión de iconografía, mostrar opciones visuales y confirmar antes de aplicarla. Aplicar la skill ui-consistency cuando corresponda.
9. **Espacio útil y accesibilidad.** Retirar ayudas obvias, títulos duplicados, etiquetas repetidas y relleno sin dejar huecos; conservar nombres accesibles, datos, procedencia, errores, estados vacíos útiles, avisos de negocio y confirmaciones destructivas. Alinear filas, columnas y controles con centrado vertical y simetría. Adaptar paneles y popups al contenido real, un solo scroll efectivo y tooltips dentro del viewport al hover/foco, sin recortar información ni reducir indiscriminadamente fuentes o superficies táctiles. Botones sin borde según el criterio visual acordado, disabled real grisáceo y foco visible; respetar el sistema de diseño del proyecto.
10. **Listados ordenables y carga eficiente.** Tablas y listados operativos: columnas de datos ordenables ascendente/descendente/sin orden con control e indicador compartidos; excluir acciones y selección. Ordenar antes de paginar o limitar, sin mutar datos, selección, cálculos ni prioridades de negocio. Mantener defaults y ámbitos de estado acordados, sin añadir persistencia por iniciativa propia. Consultas acotadas/paginadas y agregados en servidor cuando exista backend, sin descargar históricos completos para resumirlos; progreso determinado solo con medición real, no usar loaders para encubrir problemas de rendimiento. Limitar la respuesta HTTP no acredita consultas acotadas al almacenamiento; verificar paginación y coste de extremo a extremo.
11. **Responsabilidades y tooling reproducible.** Reutilizar framework y componentes nativos ya adoptados, sin imponer una biblioteca concreta a otros proyectos. Separar composición, presentación/interacción, modelo/persistencia y estilos por responsabilidad. Respetar límites de tamaño del proyecto sin comprimir código, fragmentar artificialmente ni añadir abstracciones especulativas. Makefile por proyecto, help por defecto y comandos install/run coherentes que preparan dependencias reales de forma repetible sin borrar datos; revisar efectos indirectos antes de ejecutarlos.
12. **Evidencia y generalización anónima.** Distinguir tests de modelo, render, build, DOM, inspección visual e interacción real; registrar consumidores, variantes, anchos y estados comprobados y pendientes. No afirmar revisión completa, instalación o portabilidad sin evidencia de esa fase. Al reutilizar aprendizajes entre proyectos, exportar principios anónimos sin personas, organizaciones, productos, rutas de usuario, IDs de chats, URLs privadas, cifras reales, capturas ni fuentes de negocio; no convertir reglas de dominio o decisiones locales en estándares globales.

## Definiciones operativas

- `agent`: Unidad operativa con id y proposito. Es el termino generico para cualquier participante activable del ecosistema.
  Responsabilidad: Actuar dentro de las cuatro reglas: alcance minimo, evidencia, cero especulacion y consulta humana ante incertidumbre.
- `multiagent`: Orquestador o consejo que coordina un objetivo completo y selecciona subagentes y microagentes.
  Responsabilidad: Gobernar flujo, dependencias, evidencias de salida y escalado entre negocio, producto, arquitectura, delivery y validacion.
- `subagent`: Especialista transversal de proceso o criterio, independiente de una tecnologia concreta.
  Responsabilidad: Cubrir responsabilidades como negocio, producto, arquitectura, evidencia, seguridad, implementacion, validacion o release.
- `microagent`: Especialista por tecnologia, framework, herramienta o plataforma concreta.
  Responsabilidad: Aportar routing determinista por tecnologia o patron de archivo, checks empiricos, sourceUrls oficiales y condiciones de consulta humana.
- `skill`: Capacidad reutilizable y documentada (procedimiento, playbook) que un agente puede invocar con pasos y evidencia esperada.
  Responsabilidad: Aportar un procedimiento verificable, declarar entradas/salidas y cuando consultar al humano; es independiente del runtime.
- `mcp`: Servidor o conector Model Context Protocol estandarizado que expone herramientas, recursos o prompts a los runtimes de IA.
  Responsabilidad: Declarar transporte, comando/URL, capacidades y permisos minimos; nunca ampliar alcance ni escribir sin checkpoint humano.
- `harness`: Arnes operativo que equipa un runtime/CLI: fija que reglas se aplican, que agentes/skills/mcps se montan, los guardrails y los checkpoints humanos.
  Responsabilidad: Garantizar comportamiento identico entre equipos: enlaza reglas, agentes, skills y mcps a cada runtime con guardrails y evidencia obligatoria.

## Protocolo obligatorio

1. Leer este archivo antes de actuar.
2. Reunir evidencia empirica antes de modificar nada.
3. Usar `cmlscode route <tecnologia-o-ruta>` para elegir el microagente responsable.
4. Validar con checks existentes o documentar bloqueo verificable.
5. Preguntar al humano cuando falte conocimiento, permiso o decision.

## Bucle de trabajo (loop engineering)

Trabaja en bucle: reune contexto -> actua -> verifica contra ground truth -> repite, hasta cumplir una definicion de hecho objetiva y verificable.

1. Define 'hecho' de forma objetiva ANTES de empezar (p. ej. 'tests verdes y sin errores de lint'), nunca 'parece correcto'.
2. Cierra cada iteracion con evidencia real del entorno para los checks minimos suficientes segun componentes, dependencias y riesgo; reutiliza evidencia vigente no invalidada, sin suites globales por defecto ni retirar guardas o checks obligatorios.
3. Para por varias condiciones a la vez: hecho cumplido, tope de iteraciones, sin progreso, o presupuesto agotado.
4. Sin progreso = fallo: si se repite el mismo error o accion, cambia de estrategia o escala al humano; no reintentes lo mismo.
5. Al alcanzar el tope, sintetiza el mejor resultado posible con lo hecho; nunca termines en silencio.
6. Entre iteraciones compacta el contexto (resume el log) y re-ancla el objetivo desde ficheros durables (AGENTS.md, spec); evita el goal drift.
7. Presupuesto explicito: acota tiempo, llamadas y tokens; ante un bucle de coste, corta (circuit breaker).
8. Trata los errores de herramienta como texto a razonar, no como excepcion; reintenta 429/5xx con backoff y detente en 401/403/422.
9. Delega trabajo paralelo en subagentes con contexto aislado que devuelvan un RESUMEN condensado, no su transcripcion.
10. Checkpoint humano antes de acciones irreversibles (push a main, borrados, despliegues, envios externos).

Procedimiento completo en la skill `agentic-loop`.


## Como orquestar cada peticion (routing obligatorio)

No respondas en piloto automatico ni recurras siempre a la misma skill (p. ej. code-review).
Para cada peticion no trivial actua como ORQUESTADOR:

1. Clasifica la peticion en uno o varios dominios y elige los responsables segun la tabla de routing.
2. AGENTES (subagentes): delega en ellos. En Claude Code via la herramienta Agent con `subagent_type=<id>`; en otros CLIs adopta ese rol. NO existe subagente para los consejos ni para las skills: no los pases como `subagent_type`.
3. SKILLS: invocalas como skill (en Claude Code, la herramienta Skill `/<id>`), no como agente.
4. Elige el microagente tecnico con `cmlscode route <ruta-o-tecnologia>` antes de tocar archivos de una tecnologia.
5. `code-review` se usa al revisar un cambio; `security-review` solo si se solicita analizar seguridad. La validacion empirica (`empirical-validation`, `verification-loop`) es el cierre, no la respuesta por defecto.
6. Avanza con el objetivo del usuario y la evidencia disponible; si falta acceso o una decision indispensable, delega en `human-escalation-guard` y pide solo ese dato.

Routing por tipo de peticion (agentes via Agent, skills via Skill):

- Peticion nueva o ambigua (primero entender que se pide) -> `intake-analyst` (agente), `evidence-researcher` (agente)
- Nueva funcionalidad o cambio de producto -> `product-owner-analyst` (agente), `solution-architect` (agente), `implementation-steward` (agente), `validation-auditor` (agente)
- Decision de arquitectura, integracion o NFRs -> `enterprise-architect` (agente), `solution-architect` (agente)
- Bug, incidencia o comportamiento inesperado -> `evidence-researcher` (agente), `implementation-steward` (agente), `validation-auditor` (agente), `empirical-validation` (skill)
- Entender o mapear un repo desconocido -> `evidence-researcher` (agente), `codebase-onboarding` (skill)
- Revisar un cambio YA hecho (diff, PR, commit) -> `code-review` (skill)
- Seguridad, privacidad o cumplimiento -> `security-compliance-analyst` (agente), `security-review` (skill)
- Frontend: UI, rendimiento o accesibilidad -> `solution-architect` (agente), `ux-accessibility-researcher` (agente)
- Backend: API, servicio o datos -> `solution-architect` (agente), `data-architecture-analyst` (agente)
- Despliegue, infraestructura u observabilidad -> `platform-sre` (agente)
- Version, release, changelog o rollout -> `release-manager` (agente)
- Documentacion -> `documentation-keeper` (agente)
- Investigacion profunda con varias fuentes -> `evidence-researcher` (agente), `deep-research` (skill), `official-source-check` (skill)
- Falta info, permiso o decision humana -> `human-escalation-guard` (agente)

Flujo completo (trabajos de varias fases), fase -> agente dueno:

- business-intake -> `business-strategy-analyst`
- product-discovery -> `product-owner-analyst`
- domain-and-architecture -> `enterprise-architect`
- evidence -> `evidence-researcher`
- plan -> `delivery-orchestrator`
- execute -> `implementation-steward`
- validate -> `validation-auditor`
- operate -> `platform-sre`
- handoff -> `documentation-keeper`

## Skills

- `empirical-validation`: Producir evidencia ejecutable (comandos, tests, salidas) antes de aceptar cualquier cambio.
- `secure-context-packet`: Construir un paquete de contexto de alcance configurable.
- `official-source-check`: Verificar el comportamiento esperado contra documentacion oficial antes de asumir.
- `research-first`: Buscar soluciones existentes antes de construir a medida y decidir adoptar, extender, componer o construir con evidencia.
- `self-evaluation`: Autoevaluar la salida en 5 ejes con evidencia y un scorecard 1-5 antes de entregar.
- `verification-loop`: Iterar cambio, validacion y correccion hasta que la evidencia confirme el objetivo, sin declarar exito con checks en rojo.
- `tdd-workflow`: Desarrollo dirigido por tests con ciclo RED-GREEN-REFACTOR.
- `code-review`: Revisar un cambio por correccion, alcance, seguridad, tests y claridad con evidencia.
- `security-review`: Buscar secretos, validacion de inputs, dependencias inseguras y debilitamiento de configuracion.
- `deep-research`: Investigar con varias fuentes, verificar de forma adversarial y sintetizar con citas trazables.
- `codebase-onboarding`: Mapear un repo desconocido con evidencia antes de proponer cambios.
- `spec-driven-development`: Desarrollo dirigido por especificacion (SDD, GitHub Spec Kit): constitution, spec, plan y tasks antes de implementar.
- `agentic-loop`: Conducir el bucle agentico (contexto -> accion -> verificacion -> repetir) con definicion de hecho objetiva, condiciones de parada y presupuesto.
- `ui-consistency`: Aplicar y verificar coherencia transversal, semántica de acciones, contenido compacto, listados y responsive en cambios de UI.

## MCPs

- `filesystem` (stdio): Acceso de lectura al arbol del proyecto para que los runtimes razonen con contexto real.
- `git` (stdio): Inspeccion de historial, diffs y estado del repositorio en modo lectura.
- `fetch-docs` (http): Recuperar documentacion oficial desde sourceUrls verificados para contrastar comportamiento.

## Harnesses

- `delivery-harness`: Arnes por defecto de entrega: equipa cualquier runtime con el flujo completo de negocio a validacion.
  appliesTo: cmlscode, claude, copilot, codex, cursor, gemini
  enforces: bounded-scope, evidence-first, no-speculation, human-escalation
- `review-harness`: Arnes de revision en solo lectura para auditar codigo y seguridad sin modificar el repositorio.
  appliesTo: claude, copilot, codex
  enforces: bounded-scope, evidence-first, no-speculation
- `discovery-harness`: Arnes de descubrimiento de negocio y producto antes de tocar codigo.
  appliesTo: cmlscode, claude, gemini
  enforces: bounded-scope, human-escalation

## Hooks (deterministas; nativos donde el CLI los soporta, instruction-backed en el resto)

- `verification-on-stop` [Stop / *] nativo en: claude. Recordar antes de cerrar que los checks minimos suficientes del alcance deben estar en verde con evidencia vigente, sin suites globales por defecto ni retirar guardas o checks obligatorios (no bloqueante a proposito: bloquear el Stop atraparia el bucle).

## Convenciones de estructura

- **Makefile y tools por proyecto.** Cada proyecto declara sus comandos en su propio Makefile y aloja sus scripts en su propia carpeta tools/. Ningun proyecto depende del Makefile ni de las tools de otro. Help es el objetivo por defecto; install/run preparan dependencias reales de forma repetible sin borrar datos, con revisión previa de sus efectos indirectos.
- **Cuanto mas generica es la carpeta, mas generico es el Makefile.** La raiz del workspace solo orquesta tareas genericas y herramientas compartidas; la logica especifica de un producto vive en el Makefile de ese producto. La raiz nunca hardcodea un unico proyecto y parametriza el tooling compartido.

El registro operativo completo esta en `cmlscode.registry.json`.
