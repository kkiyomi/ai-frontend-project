# AGENTS.md - AI Frontend Project Guidelines

Essential information for AI agents working in this Vue 3 + TypeScript project.

## Project Overview

- **Framework**: Vue 3 with Composition API and `<script setup>` syntax
- **Language**: TypeScript
- **State Management**: Pinia
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
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

# Install dependencies
npm install
```

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


## Project Structure

```
src/
├── modules/           # Feature modules (self-contained)
│   ├── core/         # Core functionality (settings, utils)
│   ├── billing/      # Billing functionality
│   ├── series/       # Series/chapter management
│   └── profile/      # User profile
├── components/       # Global/reusable components
├── composables/      # Global composables
├── router/          # Vue Router configuration
├── types/           # Global TypeScript types
├── utils/           # Utility functions
└── assets/          # Static assets
```

### Module Structure
Each module follows this pattern:
- `index.ts` - Module exports
- `types.ts` - Module-specific types
- `store.ts` - Pinia store (if needed)
- `components/` - Module-specific components
- `composables/` - Module-specific composables
- `api/` - API clients (mock/real implementations)

## TypeScript Configuration

- **Target**: ES2020
- **Module**: ESNext
- **Strict mode**: Enabled (`"strict": true`)
- **Unused locals/parameters**: Disabled (`"noUnusedLocals": false`, `"noUnusedParameters": false`)
- **Path alias**: `@/` points to `src/`
- **Exclusion**: `src/modules/scraper` is excluded from TypeScript compilation (see `tsconfig.app.json`)

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

- Modules register themselves via `src/settings.ts`
- API modules have `mock.ts` and `real.ts` implementations
- Mock data files use `mock_data_` prefix (bundled separately)
- Environment variables prefixed with `VITE_`
- Use `import.meta.env` for environment variables

## Common Pitfalls

- **Scraper module exclusion**: TypeScript checks skip `src/modules/scraper`
- **Mock data bundling**: Files with `mock_data_` prefix get special treatment
- **Component registration**: Remember to use `markRaw` when storing components in Pinia
- **Environment variables**: Must be prefixed with `VITE_` to be exposed

## Quick Reference

- **Start dev server**: `npm run dev`
- **Build for production**: `npm run build`
- **Type check**: `vue-tsc -b`
- **Component pattern**: `<script setup lang="ts">`
- **State management**: Pinia stores
- **Styling**: Tailwind CSS + scoped CSS
- **Path alias**: `@/` for `src/`
- **Module structure**: Feature-based organization