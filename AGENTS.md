# CLAUDE.md

  This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

  ## Project Overview

  React Mobile Picker is an iOS-like select box component for React. It's almost unstyled for easy customization.

  ## Key Commands

  ```bash
  # Development
  pnpm dev                    # Start development server on http://localhost:5173

  # Building
  pnpm build:lib             # Build the library with TypeScript + Vite
  pnpm build:examples        # Build example applications
  pnpm build:app            # Build both library and examples

  # Code Quality
  pnpm lint                  # Run ESLint on lib and examples directories

  # Preview
  pnpm preview:app          # Preview built examples

  Architecture

  Library Structure (lib/)

  - Main picker component with TypeScript
  - Minimal CSS for core functionality
  - Export through index.ts

  ---

  ## Key Patterns from Real React Projects:

  1. **Keep it under 100 lines** - Most effective examples are very concise
  2. **Commands with inline comments** - Show what each command does
  3. **Tech stack bullet points** - Quick overview of key technologies
  4. **Simple folder structure** - Visual tree or bulleted list
  5. **Environment variables** - Only if critical for setup
  6. **No code examples** - Unless it's a library showcasing API usage