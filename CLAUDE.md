# Reglas del monorepo

Este repo aloja plantillas base de proyectos (`templates/`) y el CLI
que las scaffoldea (`tools/create-project/`). Las reglas de ejecución
de comandos de `D:\github\CLAUDE.md` (no `&&`, usar flags de directorio
propias de cada herramienta) ya aplican por herencia.

## Reglas por plantilla

- Cada carpeta en `templates/` es autocontenida: sin imports cruzados
  entre plantillas, sin `node_modules`/lockfile compartido.
- Toda plantilla nueva debe incluir: `README.md` con setup, `Dockerfile`
  + CI baseline, TypeScript en modo estricto.
- Toda plantilla nueva debe usar placeholders simples (`__NOMBRE__`)
  compatibles con `tools/create-project`.
- Componentes/primitivos compartidos deben ser genéricos, configurables
  por props/inputs, sin lógica de negocio ni de una feature particular.

## Regla de oro (aplica a toda plantilla)

- Nunca hardcodear valores de estilo (colores, spacing, tipografía) en
  componentes — todo pasa por variables/tokens de diseño centralizados.
- DRY: no duplicar lógica o markup — extraer a funciones/componentes
  compartidos cuando se repite.
- SOLID adaptado a frontend: responsabilidad única por componente,
  extensible vía props/composición, dependiente de abstracciones y no
  de implementaciones concretas al cruzar capas.
- Seguir las mejores prácticas idiomáticas de cada framework.
