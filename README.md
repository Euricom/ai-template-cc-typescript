# AI Template - TypeScript React Project

A modern React TypeScript project template optimized for AI-assisted development using Claude Code.

## Overview

This is a full-featured React application built with modern tooling including Vite, TypeScript, TailwindCSS, and React Query. The project structure is optimized for AI-enhanced development workflows with Claude Code, providing organized documentation, commands, and specifications for efficient collaboration with AI coding assistants.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: TailwindCSS 4 with CSS animations
- **UI Components**: Radix UI primitives with custom design system
- **State Management**: TanStack React Query for server state
- **Routing**: React Router 7
- **Theme**: next-themes for dark/light mode
- **Notifications**: Sonner for toast notifications
- **HTTP Client**: ofetch for API calls
- **Schema Validation**: Zod
- **Package Manager**: pnpm

## Project Structure

```
{root}/
├── .claude/
│   ├── commands/       # Custom Claude Code command definitions
│   ├── agents/         # AI agent configurations
│   ├── hooks/          # Development lifecycle hooks
│   └── settings.json   # Claude Code settings
├── ai_docs/            # AI-specific documentation
│   ├── architecture.md # System architecture docs
│   ├── design_patterns.md # Code patterns and conventions
│   └── domain_concepts.md # Business domain knowledge
├── specs/              # Feature specifications
├── src/
│   ├── api/           # API layer with type-safe clients
│   ├── components/    # Reusable UI components
│   ├── contexts/      # React contexts (Theme, etc.)
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── pages/         # Route components
│   ├── App.tsx        # Root application component
│   └── main.tsx       # Application entry point
├── package.json
└── vite.config.ts
```

## Development

### Prerequisites

- Node.js 18+
- pnpm (recommended package manager)

### Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Start development server**:
   ```bash
   pnpm dev
   ```

3. **Build for production**:
   ```bash
   pnpm build
   ```

### Available Scripts

```bash
# Development
pnpm dev              # Start Vite dev server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run ESLint
pnpm test             # Run tests
pnpm test:coverage    # Run tests with coverage

# Development Tools
pnpm type-check       # TypeScript type checking
```

## AI-Enhanced Development

This template is specifically designed for efficient collaboration with Claude Code through:

### 1. Claude Commands (`.claude/commands/`)

Custom reusable commands that streamline AI interactions:

- **Project Context**: Commands to quickly prime Claude with project structure
- **Code Generation**: Standardized workflows for component creation
- **Quality Assurance**: Automated testing and linting workflows
- **Invocation**: Use `/command_name` in Claude Code

### 2. AI Documentation (`ai_docs/`)

Specialized documentation to enhance AI understanding:

- **Architecture**: System design and component relationships
- **Design Patterns**: Established code patterns and conventions
- **Domain Concepts**: Business logic and terminology
- **Reference**: Use `@[ai_docs/filename]` in conversations

### 3. Feature Specifications (`specs/`)

Structured specifications for planned features:

- **Implementation Blueprints**: Detailed specs for types, methods, and tests
- **Consistency**: Standardized format ensures complete specifications
- **AI Integration**: Optimized for consumption by Claude Code
- **Reference**: Use `@[specs/filename]` in conversations

## Environment Configuration

Create a `.env.local` file for local environment variables:

```bash
VITE_APP_NAME="Your App Name"
VITE_API_BASE_URL="http://localhost:3001"
VITE_USE_HASH_ROUTE="false"
```

