# Monorepo de plantillas — Diseño

**Fecha:** 2026-09-07
**Estado:** Aprobado, pendiente de implementación

## Contexto

`template` es un monorepo que va a alojar plantillas base de proyectos
para uso futuro, empezando por una de Next.js/React y luego una de
Angular. Antes de diseñar cada plantilla individual, este documento
define la estructura raíz, el CLI que scaffoldea proyectos nuevos a
partir de una plantilla, y las reglas compartidas entre todas las
plantillas. Cada plantilla concreta (Next.js/React, Angular) es un
sub-proyecto con su propia spec, construida sobre estas bases.

## Estructura raíz

```
template/
  tools/
    create-project/
      index.mjs                 # entry point del CLI
      copy.mjs                  # copia recursiva + exclusiones
      replace-placeholders.mjs  # find/replace de placeholders
      setup.mjs                 # pnpm install + git init en destino
  templates/
    nextjs-react/                # plantilla Next.js/React (spec aparte)
    angular/                     # plantilla Angular (spec aparte, futura)
  docs/
    cys/
      specs/
      plans/
  package.json                   # script `create:project`, dep: prompts
  CLAUDE.md                      # reglas compartidas (ver abajo)
  README.md
```

Cada carpeta bajo `templates/` es autocontenida y "copiable tal cual":
no depende de nada de la raíz salvo la convención de placeholders. No
son miembros de un workspace de pnpm — se copian a un destino nuevo,
no se instalan como paquetes internos del monorepo.

## CLI de scaffolding (`pnpm create:project`)

Node.js puro (multiplataforma), sin dependencias pesadas — `prompts`
para los prompts interactivos, utilidades nativas de Node
(`fs`/`path`/`child_process`) para el resto.

Flujo:

1. Prompt: elegir plantilla (lista de subcarpetas detectadas en
   `templates/`; hoy solo `nextjs-react`)
2. Prompts: nombre del proyecto, color primario del tema, URL base de
   la API externa
3. Prompt: ruta destino (default `../<nombre-del-proyecto>`, fuera del
   monorepo)
4. Copia `templates/<elegida>/` → destino, excluyendo `node_modules`,
   `.git`, lockfiles
5. Reemplaza placeholders (`__PROJECT_NAME__`, `__THEME_PRIMARY__`,
   `__API_BASE_URL__`) en todos los archivos de texto del destino
6. Corre `pnpm install` en destino
7. Corre `git init` + primer commit en destino
8. Imprime resumen: ruta creada, próximos pasos (`cd`, `pnpm dev`)

### Convención de placeholders

Placeholders simples tipo `__NOMBRE__`, insertados en cualquier
archivo de texto de la plantilla (`package.json`, `.env.example`,
`globals.css`, etc.) y reemplazados por find/replace plano — sin motor
de templates. Toda plantilla nueva agregada al monorepo debe seguir
esta misma convención para ser compatible con el CLI.

## Reglas compartidas (`CLAUDE.md` de la raíz)

- Cada carpeta en `templates/` es autocontenida: sin imports cruzados
  entre plantillas, sin `node_modules`/lockfile compartido
- Toda plantilla nueva debe incluir: `README.md` con setup,
  `Dockerfile` + CI baseline, TypeScript en modo estricto
- Toda plantilla nueva debe usar la convención de placeholders de
  arriba
- Componentes/primitivos compartidos deben ser genéricos, configurables
  por props/inputs, sin lógica de negocio ni de una feature particular
  (cada framework lo implementa a su manera: props en React, `@Input()`
  en Angular)
- **Regla de oro, aplica a toda plantilla:**
  - Nunca hardcodear valores de estilo (colores, spacing, tipografía)
    directo en componentes — todo pasa por variables/tokens de diseño
    centralizados (CSS variables / tema), nunca literales sueltos
  - DRY: no duplicar lógica o markup — extraer a funciones/componentes
    compartidos cuando se repite
  - SOLID (adaptado a frontend): componentes con una responsabilidad
    clara, abiertos a extensión vía props/composición en vez de
    modificación interna, dependientes de abstracciones (interfaces/
    tipos) y no de implementaciones concretas cuando cruzan capas
  - Seguir las mejores prácticas idiomáticas de cada framework en vez
    de imponer patrones ajenos a él
- Las reglas de ejecución de comandos de `D:\github\CLAUDE.md` (no
  `&&`, usar flags de directorio propias de cada herramienta) ya
  aplican por herencia al ser este repo una subcarpeta — no se repiten
  acá

## Fuera de alcance

- El contenido específico de cada plantilla (Next.js/React, Angular) —
  spec aparte por plantilla
- Publicar el CLI como paquete npm instalable — uso local dentro del
  monorepo por ahora
- Un motor de templates con lógica condicional — placeholders simples
  alcanzan para el caso de uso actual
