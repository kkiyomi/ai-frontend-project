# AGENTS.md - AI Frontend Project Guidelines

Essential information for AI agents working in this Vue 3 + TypeScript project.

**NOTE:** This file was revised on 2026-06-05. Previous version listed only 10 modules — 11 now exist.

## Project Overview

- **Framework**: Vue 3 with Composition API and `<script setup>` syntax
- **Language**: TypeScript
- **State Management**: Pinia
- **Styling**: daisyUI v5, Tailwind CSS v4
- **Build Tool**: Vite 8
- **Router**: Vue Router 4

## Build and Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production (includes type checking)
npm run build

# Preview production build locally
npm run preview

# Type checking only (used in build process)
vue-tsc -b
```

**Cross-project note**: The Odoo backend (`AsuraRealm/`) requires module updates after any change (`docker compose exec odoo odoo --stop-after-init -d Asura_001 -u <module>`). This applies only to the backend — the frontend has no Odoo modules.

**Note**: No linting or testing commands configured. Type checking performed during `npm run build`.

## Architecture

The project follows a **modular architecture** where each domain is implemented as a self-contained module.

### Core Principles

- **Feature-based modules**: Code is organized by domain (e.g., series, billing, profile).
- **Module isolation**: Modules should not directly depend on other feature modules.
- **Minimal cross-module imports**:
  - Feature modules **must not import from other feature modules**.
  - Shared logic should be placed in global layers.
- **Globally accessible modules**:
  - `core` – shared infrastructure, base services, and utilities.
  - `billing` – subscription and payment logic.
  - These modules **may be imported by any feature module**.

### Shared Logic

If functionality must be reused across the application, it should be implemented in one of the shared layers:

- `components/` – UI components that rely on multiple feature modules
- `composables/` – reusable Composition API logic that rely on multiple feature modules
- `utils/` – shared utility functions
- `types/` – global TypeScript types

Feature modules are designed to be **fully standalone** and must not depend on other feature modules.

Instead, shared layers (such as `components/` and `composables/`) may import functionality from modules when necessary. This preserves module isolation while allowing shared abstractions to be built on top of module functionality.

### Module Isolation Compliance

Verified: **Zero violations** of module isolation. Feature modules only import from `core` and `billing` (designated as globally accessible).

## Project Structure

```
src/
├── modules/           # Feature modules (self-contained)
│   ├── core/         # Core functionality (settings, utils, services, stores)
│   ├── billing/      # Billing & subscription functionality
│   ├── series/       # Series/chapter management
│   ├── profile/      # User profile
│   ├── theme/        # Appearance and theme management
│   ├── chapters/     # Chapter reading/navigation
│   ├── editor/       # Chapter editing (directives/, utils.ts)
│   ├── glossary/     # Glossary terms management
│   ├── announcements/# Announcements display
│   ├── share/        # Public share/publish link reader views + translator UI
│   └── translation/  # Translation interface (sseClient.ts)
├── components/       # Global/reusable components
├── composables/      # Global composables
├── router/          # Vue Router configuration
├── types/           # Global TypeScript types
├── utils/           # Utility functions
├── assets/          # Static assets
└── mock/            # Mock data for development
```

### Module Structure
Each module follows this pattern (+ deviations noted):
- `index.ts` - Module exports
- `types.ts` - Module-specific types
- `store.ts` - Pinia store (if needed)
- `components/` - Module-specific components
- `composables/` - Module-specific composables
- `api/` - API clients (mock/real implementations)

**Notable deviations:**
- `core/` has additional `services/`, `stores/` (second), and `utils/` subdirectories
- `editor/` has `directives/` directory and `utils.ts` but no `api/`
- `theme/` has `composables/` but no `api/`
- `billing/` has `constants.ts`, `settings.ts`, `utils.ts` alongside standard files
- `translation/` has `sseClient.ts` for Server-Sent Events

## TypeScript Configuration

- **Target**: ES2020
- **Module**: ESNext
- **Module resolution**: bundler
- **Strict mode**: Enabled (`"strict": true`)
- **Unused locals/parameters**: Disabled (`"noUnusedLocals": false`, `"noUnusedParameters": false`)
- **Path alias**: `@/` points to `src/`
- **Additional settings**: `isolatedModules: true`, `skipLibCheck: true`, `noEmit: true`
- **Exclusion**: `src/modules/scraper` is excluded from TypeScript compilation (see `tsconfig.app.json`) — note: the directory does not actually exist; only `src/types/scraper.ts` exists with scraper type definitions
- **`tsconfig.node.json`**: Has stricter unused checks for Vite config only

## Code Style Guidelines

### File Naming
- **Vue components**: PascalCase (e.g., `SeriesEditModal.vue`)
- **TypeScript files**: camelCase (e.g., `useNovelScraper.ts`)
- **Type definitions**: camelCase (e.g., `scraper.ts`)
- **Store files**: `store.ts`
- **Composables**: `useCamelCase.ts` prefix

### Vue Components
- Use `<script setup lang="ts">` syntax
- Import composables and utilities at the top
- Use reactive state with `ref`, `reactive`, `computed`
- Template uses kebab-case for CSS classes and event handlers
- Define props and emits with TypeScript interfaces

### TypeScript & Imports
- Define interfaces/types for props, emits, reactive state
- Use explicit return types for functions
- Prefer `interface` over `type` for object definitions
- Export types from centralized module files
- Import order: Vue/framework → external libraries → `@/` → relative → type imports

### State Management with Pinia
- Use Pinia stores for shared state
- Follow Composition API style stores
- Define stores in `store.ts` files within modules
- Use `markRaw` for component references in stores

### Composables Pattern
- Name with `use` prefix (camelCase)
- Return an object with reactive properties and methods
- Handle loading, error, and data states

### Error Handling
- Use try-catch blocks for async operations
- Convert errors to user-friendly messages
- Set error state in reactive variables

### Styling Guidelines
- Use Tailwind CSS utility classes primarily
- Custom CSS in `<style scoped>` blocks when needed
- Define custom Tailwind components in `@layer components`

## Development Notes

- Modules register themselves via `src/settings.ts` (currently 3 sections registered: profile, billing, appearance/theme)
- API modules may have `mock.ts` and `real.ts` implementations (billing ✓, series ✓, translation ✓, announcements ✓; chapters and glossary only have `real.ts`)
- Mock data files use `mock_data_` prefix (bundled separately via custom `rollupOptions.output.manualChunks` in `vite.config.ts`)
- Environment variables prefixed with `VITE_`
- Use `import.meta.env` for environment variables
- Custom Vite config: `@tailwindcss/vite` plugin, `@vitejs/plugin-vue`, `allowedHosts` for CodeSandbox

## Key Dependencies

### Runtime
- `vue` ^3.4, `vue-router` ^4.5, `pinia` ^3.0
- `jszip` ^3.10 (zip file export)
- `papaparse` ^5.5 (CSV parsing)
- `autoprefixer` ^10.4, `postcss` ^8.5

### Dev
- `vite` ^8.0, `vue-tsc` ^2.1, `typescript` ^5.5
- `@vitejs/plugin-vue` ^6.0
- `tailwindcss` ^4.2, `daisyui` ^5.5
- `@tailwindcss/postcss` ^4.1, `@tailwindcss/vite` ^4.2

## Common Pitfalls

- **Mock data bundling**: Files with `mock_data_` prefix get special treatment via custom rollup chunking
- **Component registration**: Remember to use `markRaw` when storing components in Pinia
- **Environment variables**: Must be prefixed with `VITE_` to be exposed
- **Settings registration**: Not automatic — must manually `registerSection()` in `src/settings.ts`
- **API mock/real pairs**: Some modules lack `mock.ts` files (chapters, glossary) — check before assuming

## Quick Reference

- **Start dev server**: `npm run dev`
- **Build for production**: `npm run build`
- **Type check**: `vue-tsc -b`
- **Component pattern**: `<script setup lang="ts">`
- **State management**: Pinia stores
- **Styling**: Tailwind CSS + scoped CSS
- **Path alias**: `@/` for `src/`
- **Module structure**: Feature-based organization
- **Modules**: 11 total (core, billing, series, profile, theme, chapters, editor, glossary, announcements, share, translation)

## MANDATORY: AGENTS.md Auto-Update Rule

**Every AI agent that makes structural changes to this project MUST update this file as part of the same unit of work.** This is not optional.

### Trigger events (any of the following require an update):

1. **Module added or removed** — update the module list
2. **New dependency added** (major lib) — update the Key Dependencies section
3. **New shared layer created** (`components/`, `composables/`, `utils/`, `types/`) — update structure
4. **Test files added** — update the note about no testing being configured
5. **Linting tooling added** — update the commands section and "No linting" note
6. **Vite config changes** (new plugins, significant rollup changes) — update Development Notes
7. **Architecture rules change** (module isolation rules, import patterns) — update Core Principles
8. **TypeScript config changes** (strict mode, path aliases, excludes) — update TypeScript Configuration

### How to update:

1. Read the existing file first
2. Identify which claims are now stale
3. Make targeted edits — only update what changed, preserve the rest
4. If correcting a factual error, add a brief note so future agents understand the history

### Exemptions:

- Pure bug fixes with no structural impact
- Whitespace/cosmetic changes
- Dependency version bumps within the same major version
- Changes to `src/mock/` or `src/assets/`

**When in doubt, update.** Stale documentation is worse than slightly verbose documentation.
