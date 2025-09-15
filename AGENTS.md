# AGENTS.md

This file provides guidance to AI coding assistants working in this repository.

Note: CLAUDE.md is a symlink to AGENTS.md in this project.

## Project Overview

This is a React TypeScript application built with:
- **React 19** with TypeScript
- **Vite 6** for build tooling
- **TailwindCSS 4** for styling
- **Radix UI** for component primitives
- **TanStack React Query** for state management
- **React Router 7** for routing
- **pnpm** as package manager

### Search Command Requirements

**CRITICAL**: Always use `rg` (ripgrep) instead of traditional `grep` and `find` commands:

```bash
# ❌ Don't use grep
grep -r "pattern" .

# ✅ Use rg instead
rg "pattern"

# ❌ Don't use find with name
find . -name "*.tsx"

# ✅ Use rg with file filtering
rg --files | rg "\.tsx$"
# or
rg --files -g "*.tsx"
```

## Development Commands

### Build and Development
```bash
pnpm dev              # Start Vite development server
pnpm build            # TypeScript compilation and Vite build
pnpm preview          # Preview production build
```

### Code Quality
```bash
pnpm lint             # ESLint checking
pnpm test             # Run test suite
pnpm test:coverage    # Run tests with coverage
```

### Project Structure Commands
```bash
# Find React components
rg --files -g "*.tsx" src/components/

# Find API definitions
rg --files -g "*.ts" src/api/

# Find custom hooks
rg --files -g "*.ts" src/hooks/

# Find pages/routes
rg --files -g "*.tsx" src/pages/
```

## Code Conventions

### Import Aliases
- Use `@/` for src directory imports
- Example: `import { Button } from "@/components/ui/button"`

### Component Structure
- Use functional components with TypeScript
- Place UI components in `src/components/ui/`
- Place feature components in `src/components/`
- Use Radix UI primitives for base components

### API Layer
- API clients in `src/api/`
- Use `ofetch` for HTTP requests
- Type definitions in separate `.types.ts` files
- Use TanStack React Query for data fetching

### Styling
- Use TailwindCSS classes
- Component variants with `class-variance-authority`
- Utility functions in `src/lib/utils.ts`

### State Management
- Server state: TanStack React Query
- Client state: React hooks and context
- Theme: next-themes provider

## Important Notes

### Environment Variables
- Prefix with `VITE_` for client-side access
- Configure in `.env.local` for local development
- Example: `VITE_APP_NAME`, `VITE_API_BASE_URL`

### Routing
- Uses React Router 7
- Can switch between BrowserRouter and HashRouter via `VITE_USE_HASH_ROUTE`
- Route components in `src/pages/`

### Theme Support
- Dark/light mode via next-themes
- Theme context in `src/contexts/ThemeContext`

