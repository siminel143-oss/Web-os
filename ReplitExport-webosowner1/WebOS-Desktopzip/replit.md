# WebOS Desktop

## Overview

WebOS Desktop is a browser-based desktop environment that simulates a modern operating system experience. It features draggable windows, built-in applications (notes, files, browser, settings, about), customizable themes, wallpapers, and a taskbar with system indicators. The application is built as a full-stack TypeScript project with a React frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: React Query for server state, React useState/useEffect for local state
- **Styling**: Tailwind CSS v4 with custom CSS variables for theming
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Animations**: Framer Motion for window animations and transitions
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript compiled with tsx
- **API Pattern**: RESTful routes prefixed with `/api`
- **Storage**: Pluggable storage interface with in-memory implementation (MemStorage)
- **Build**: esbuild for production bundling with selective dependency bundling

### Desktop Window System
- Windows are managed as state objects with position, size, and z-index tracking
- Each window type corresponds to an app ID (notes, files, browser, settings, about)
- User preferences (theme, accent color, wallpaper, notes) persist to localStorage

### Database Schema
- PostgreSQL with Drizzle ORM
- Schema defined in `shared/schema.ts`
- Currently contains a users table with id, username, and password fields
- Zod integration for schema validation via drizzle-zod

### Project Structure
```
client/           # Frontend React application
  src/
    components/ui/  # shadcn/ui components
    pages/          # Route components (desktop, not-found)
    hooks/          # Custom React hooks
    lib/            # Utilities and query client
server/           # Backend Express application
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Data storage interface
  static.ts       # Static file serving
  vite.ts         # Vite dev server integration
shared/           # Shared code between client/server
  schema.ts       # Database schema definitions
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management
- **drizzle-kit**: Database migrations and schema push

### UI Framework
- **Radix UI**: Accessible, unstyled component primitives (dialog, popover, dropdown, etc.)
- **shadcn/ui**: Pre-styled component library using Radix primitives
- **Lucide React**: Icon library

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **Framer Motion**: Animation library
- **date-fns**: Date formatting utilities
- **class-variance-authority**: Component variant management
- **tailwind-merge/clsx**: Utility class merging

### Backend Libraries
- **Express 5**: Web server framework
- **connect-pg-simple**: PostgreSQL session store
- **express-session**: Session management

### Build Tools
- **Vite**: Frontend development server and bundler
- **esbuild**: Fast server-side bundling
- **TypeScript**: Type checking across the project