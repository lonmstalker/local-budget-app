# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the production application with Turbopack
- `npm start` - Start the production server

### Code Quality
- `npm run lint` - Run Biome linter to check code quality
- `npm run format` - Auto-format code with Biome

## Architecture

### Tech Stack
- **Framework**: Next.js 15.5 with App Router and Turbopack
- **Language**: TypeScript with strict mode enabled
- **Database**: Dexie.js (IndexedDB wrapper) for client-side storage
- **State Management**: Zustand for global state, React Query for server state
- **UI Components**: Custom components built with Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS-in-JS
- **Formatter/Linter**: Biome (replaces ESLint and Prettier)

### Project Structure
- `/src/app/` - Next.js App Router pages and layouts
- `/src/components/` - React components organized by feature
  - `/ui/` - Reusable UI components (buttons, cards, forms, etc.)
  - Feature-specific components in subdirectories (transactions, analytics, etc.)
- `/src/lib/` - Core utilities and business logic
  - `/db/` - Database layer with Dexie.js schema and operations
  - `/hooks/` - Custom React hooks for data fetching and state
  - `/utils/` - Utility functions for formatting, calculations, etc.
- `/src/stores/` - Zustand store definitions
- `/src/types/` - TypeScript type definitions
- `/src/locales/` - Internationalization files

### Key Architectural Patterns

#### Database Layer
The app uses Dexie.js for IndexedDB storage with versioned schema migrations. All database operations are in `/src/lib/db/index.ts` with the schema defined in `/src/lib/db/schema.ts`. The database includes:
- Transactions with sync status tracking
- Categories with custom/default distinction
- Accounts with balance tracking
- Fixed expenses and planned income tracking
- Settings persistence

#### State Management
- **Zustand stores** (`/src/stores/`) handle global application state
- **React Query** manages server/database state with caching
- Custom hooks in `/src/lib/hooks/` provide data access abstractions

#### Component Architecture
- UI components use Radix UI primitives for accessibility
- Components follow composition pattern with variants using CVA (class-variance-authority)
- Form components integrate with controlled state management
- All components use TypeScript with strict typing

### Path Aliases
- `@/*` maps to `./src/*` for clean imports