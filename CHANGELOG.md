# Changelog

## [0.1.0] - 2026-09-07

### Added
- Monorepo structure for project templates (`templates/`) with shared
  rules in `CLAUDE.md`.
- `pnpm create:project` CLI that scaffolds a new project from a
  template: copies files, replaces `__PROJECT_NAME__` / `__THEME_PRIMARY__`
  / `__API_BASE_URL__` placeholders, runs `pnpm install`, and initializes git.
