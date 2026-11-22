# Ecosistema cmlscode

Este proyecto usa `cmlscode.registry.json` como fuente de verdad machine-readable.

## Microagentes disponibles

| ID | Tecnologia |
| --- | --- |
| `python` | Python |
| `python-qt` | Python / Qt (PySide/PyQt) |
| `shell` | Shell POSIX/Bash |
| `git` | Git |
| `markdown-docs` | Markdown |
| `json-yaml` | JSON/YAML |
| `github-actions` | GitHub Actions |
| `docker` | Docker/OCI |
| `web-platform-mdn` | Web Platform HTML/CSS/DOM |
| `typescript-javascript` | TypeScript/JavaScript |
| `nodejs-runtime` | Node.js |
| `react` | React |
| `nextjs` | Next.js |
| `angular` | Angular |
| `vue` | Vue |
| `nuxt` | Nuxt |
| `svelte` | Svelte/SvelteKit |
| `astro` | Astro |
| `vite` | Vite |
| `css-tailwind` | CSS/Tailwind |
| `frontend-testing` | Frontend Testing |
| `node-backend` | Node.js Backend |
| `nestjs` | NestJS |
| `graphql` | GraphQL |
| `openapi-api-design` | OpenAPI/API Design |
| `php-runtime` | PHP |
| `composer` | Composer |
| `laravel` | Laravel |
| `symfony` | Symfony |
| `wordpress` | WordPress |
| `drupal` | Drupal |
| `php-testing` | PHP Testing |
| `doctrine-orm` | Doctrine ORM |
| `java-runtime` | Java/JDK |
| `spring-boot` | Spring Boot |
| `quarkus` | Quarkus |
| `micronaut` | Micronaut |
| `jakarta-ee` | Jakarta EE |
| `maven-gradle` | Maven/Gradle |
| `junit-testcontainers` | JUnit/Testcontainers |
| `java-persistence` | JPA/Hibernate |
| `relational-databases` | SQL/RDBMS |
| `mongodb` | MongoDB |
| `redis` | Redis |
| `kafka` | Apache Kafka |
| `kubernetes` | Kubernetes |
| `terraform` | Terraform/OpenTofu |
| `observability` | Observability |
| `security-owasp` | Application Security/OWASP |
| `accessibility-wcag` | Accessibility/WCAG |

## Skills disponibles

| ID | Proposito |
| --- | --- |
| `empirical-validation` | Producir evidencia ejecutable (comandos, tests, salidas) antes de aceptar cualquier cambio. |
| `secure-context-packet` | Construir un paquete de contexto de alcance configurable. |
| `official-source-check` | Verificar el comportamiento esperado contra documentacion oficial antes de asumir. |
| `research-first` | Buscar soluciones existentes antes de construir a medida y decidir adoptar, extender, componer o construir con evidencia. |
| `self-evaluation` | Autoevaluar la salida en 5 ejes con evidencia y un scorecard 1-5 antes de entregar. |
| `verification-loop` | Iterar cambio, validacion y correccion hasta que la evidencia confirme el objetivo, sin declarar exito con checks en rojo. |
| `tdd-workflow` | Desarrollo dirigido por tests con ciclo RED-GREEN-REFACTOR. |
| `code-review` | Revisar un cambio por correccion, alcance, seguridad, tests y claridad con evidencia. |
| `security-review` | Buscar secretos, validacion de inputs, dependencias inseguras y debilitamiento de configuracion. |
| `deep-research` | Investigar con varias fuentes, verificar de forma adversarial y sintetizar con citas trazables. |
| `codebase-onboarding` | Mapear un repo desconocido con evidencia antes de proponer cambios. |
| `spec-driven-development` | Desarrollo dirigido por especificacion (SDD, GitHub Spec Kit): constitution, spec, plan y tasks antes de implementar. |
| `agentic-loop` | Conducir el bucle agentico (contexto -> accion -> verificacion -> repetir) con definicion de hecho objetiva, condiciones de parada y presupuesto. |
| `ui-consistency` | Aplicar y verificar coherencia transversal, semántica de acciones, contenido compacto, listados y responsive en cambios de UI. |

## MCPs disponibles

| ID | Transporte | Proposito |
| --- | --- | --- |
| `filesystem` | stdio | Acceso de lectura al arbol del proyecto para que los runtimes razonen con contexto real. |
| `git` | stdio | Inspeccion de historial, diffs y estado del repositorio en modo lectura. |
| `fetch-docs` | http | Recuperar documentacion oficial desde sourceUrls verificados para contrastar comportamiento. |

## Harnesses disponibles

| ID | appliesTo | enforces |
| --- | --- | --- |
| `delivery-harness` | cmlscode, claude, copilot, codex, cursor, gemini | bounded-scope, evidence-first, no-speculation, human-escalation |
| `review-harness` | claude, copilot, codex | bounded-scope, evidence-first, no-speculation |
| `discovery-harness` | cmlscode, claude, gemini | bounded-scope, human-escalation |

Consulta detallada: `cmlscode list` y `cmlscode show <id>`.
