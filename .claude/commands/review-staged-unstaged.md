# staged TypeScript Codebase Review

List and review any files in the staging area, both staged and unstaged.
Ensure you look at both new files and modified files.

Check the diff of each file to see what has changed.

Previous review report: $ARGUMENTS

May or may not be added, ignore the previous review if not specified.

## Review Focus Areas

1. **TypeScript Code Quality**
   - Strict TypeScript usage with explicit types
   - No `any` types - use `unknown` if type is truly unknown
   - Proper type imports with `import type { }` syntax
   - Component props interfaces defined
   - Following TypeScript strict mode compliance

2. **Performance & Bundle Optimization**
   - No unnecessary client-side JavaScript
   - Appropriate hydration strategy choices
   - Bundle size considerations
   - No over-hydration of static content

3. **Security & Validation**
   - Input validation with Zod schemas
   - Environment variables properly typed
   - Content Security Policy implementation
   - No hardcoded secrets in client-side code
   - API route validation with proper error handling

4. **Content Management**
   - Content collections properly configured
   - Zod schemas for all content types
   - Type-safe content queries
   - Proper content rendering and data handling

5. **Package Management**
   - Using pnpm (not npm or yarn)
   - Proper dependency management
   - No unused dependencies
   - Correct dev vs runtime dependencies

6. **Code Structure & Architecture**
   - Components under 200 lines (500 line hard limit)
   - Functions under 50 lines with single responsibility
   - Proper separation of concerns
   - Feature-based organization
   - Islands architecture principles followed

7. **Testing & Quality Assurance**
   - Vitest configuration and tests
   - 80%+ test coverage maintained
   - API route integration tests
   - Proper mocking of external dependencies

8. **Build & Development**
   - ESLint compliance with zero warnings
   - Prettier formatting applied
   - Production build succeeds
   - No hydration mismatches

9.  **Documentation & Maintenance**
    - Clear component interfaces
    - Proper prop descriptions
    - CLAUDE.md updates for new patterns/dependencies
    - README updates if needed

## Review Output

Create a concise review report with:

```markdown
# TypeScript Code Review #[number]

## Summary
[2-3 sentence overview focusing on TypeScript quality]

## Issues Found

### 🔴 Critical (Must Fix)
- [Issue with file:line and suggested fix - focus on type safety, hydration, security]

### 🟡 Important (Should Fix)
- [Issue with file:line and suggested fix - focus on performance, patterns]

### 🟢 Minor (Consider)
- [Improvement suggestions for optimization, maintainability]

## Good Practices
- [What was done well - highlight proper JS patterns, TypeScript usage]

## TypeScript Quality
- [Type safety assessment]
- [Strict mode compliance]
- [Interface definitions]

## Test Coverage
Current: X% | Required: 80%
Missing tests: [list with focus on component and API tests]

## Build Validation
- [ ] `pnpm run lint` passes
- [ ] `pnpm run build` succeeds
- [ ] `pnpm test` passes with 80%+ coverage
```

Save report to PRPs/code_reviews/review[#].md (check existing files first)