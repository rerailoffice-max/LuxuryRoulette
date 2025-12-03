# Lucky Draw Roulette Application

## Overview

This is a glamorous lottery roulette application designed for events and parties. The application provides a theatrical, game-show-style experience for conducting random drawings with dramatic animations, sound effects, and confetti celebrations. Users can input a list of participant names, spin a virtual roulette to select winners, and manage the drawing process through intuitive controls. The interface emphasizes high-energy visual presentation with bold typography, generous spacing, and clear state transitions between setup, drawing, and winner celebration modes.

## Key Features

### Winner History & Export
- Complete history log of all winners with timestamps and round numbers
- Export winners as CSV file for spreadsheet applications
- Copy winners to clipboard as formatted text
- Clear history functionality to start fresh

### Customizable Roulette Settings
- Adjustable spin duration (1-10 seconds)
- Three speed presets: Slow, Normal, Fast (affects animation timing)
- Settings persist during session

### Visual Themes
- **Golden Classic** (Default): Amber/gold color scheme with warm glow effects
- **Casino Royale**: Red and gold theme with casino-inspired aesthetics
- **Festival Party**: Vibrant pink/purple rainbow theme for parties
- **Corporate Pro**: Professional blue theme for business events
- Each theme affects title colors, button styling, confetti colors, and glow effects

### Custom Sound Effects
- Upload custom drum roll sound (MP3/WAV/OGG, max 10MB)
- Upload custom fanfare sound for winner reveal
- Preview sounds before using
- Reset to default sounds anytime
- Supports audio formats: MP3, WAV, OGG

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18+** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, providing fast HMR and optimized production builds
- **Wouter** for lightweight client-side routing (replacing React Router)
- **Single Page Application (SPA)** architecture with client-side routing

**State Management**
- **React hooks** (useState, useCallback, useRef, useEffect) for local component state
- **TanStack Query (React Query)** for server state management and data fetching
- Custom context providers for theme management (dark/light mode toggle)
- Ref-based management for audio elements and animation intervals

**UI Component System**
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design tokens
- Component configuration using `components.json` with path aliases
- Custom CSS variables for theming support (defined in `index.css`)

**Design System Implementation**
- Typography hierarchy using Google Fonts (Orbitron for display, Inter for body text)
- Viewport-adaptive layouts with responsive spacing primitives
- Three distinct application states: Setup → Spinning → Winner celebration
- Theatrical presentation with full-screen immersive experiences during draws

**Animation & Visual Effects**
- **canvas-confetti** library for celebratory particle effects
- Custom spin animations using intervals and state transitions
- Sound effects integration via HTML5 Audio API (drum roll and fanfare)
- Smooth state transitions with Tailwind animation utilities

### Backend Architecture

**Server Framework**
- **Express.js** running on Node.js for HTTP server
- **HTTP server** created using Node's native `http` module
- TypeScript for type safety across server code

**Routing Strategy**
- Centralized route registration in `server/routes.ts`
- API routes prefixed with `/api` convention
- Static file serving for production builds via `server/static.ts`
- Fallback to `index.html` for client-side routing support

**Development Environment**
- **Vite middleware mode** for development with HMR support
- Dynamic HTML template injection with cache-busting query parameters
- Request logging middleware with timestamp and duration tracking
- Runtime error overlay plugin for development feedback

**Build & Deployment**
- **esbuild** for server-side bundling with selective dependency bundling
- Separate client and server build processes
- Production builds output to `dist/` directory
- Environment-based configuration (NODE_ENV)

### Data Storage Solutions

**Database Configuration**
- **PostgreSQL** configured via Drizzle ORM (using `@neondatabase/serverless` for Neon compatibility)
- Database connection string via `DATABASE_URL` environment variable
- Migration system configured to output to `./migrations` directory

**Schema Design**
- User table with UUID primary keys, username, and password fields
- Schema definitions in `shared/schema.ts` for sharing between client and server
- Zod schemas generated from Drizzle schemas for validation
- Type inference for insert and select operations

**Storage Abstraction**
- `IStorage` interface defining CRUD operations
- `MemStorage` class providing in-memory implementation for development
- Extensible design allowing database storage implementation
- Storage instance exported as singleton in `server/storage.ts`

**Rationale**: The abstraction layer allows rapid development with in-memory storage while maintaining the ability to swap in database-backed storage without changing consuming code. This supports testing and development workflows.

### Authentication & Authorization

**Current Implementation**
- Basic user schema with username/password fields defined
- No active authentication middleware implemented yet
- Infrastructure prepared for session-based or token-based auth

**Prepared Dependencies**
- `express-session` for session management
- `connect-pg-simple` for PostgreSQL session store
- `memorystore` for memory-based session storage
- `passport` and `passport-local` for authentication strategies
- `jsonwebtoken` for JWT token generation

### External Dependencies

**UI & Component Libraries**
- **Radix UI** primitives (accordion, dialog, dropdown, popover, tabs, toast, etc.)
- **shadcn/ui** component system with New York style variant
- **class-variance-authority** for component variant management
- **clsx** and **tailwind-merge** for className utilities

**Data Fetching & State**
- **TanStack Query (React Query) v5** for async state management
- Custom query client configuration with credential support

**Styling & Design**
- **Tailwind CSS v3** with PostCSS and Autoprefixer
- **Google Fonts** (Orbitron, Inter, Bebas Neue) via CDN
- Custom CSS variables for theme customization

**Animation & Effects**
- **canvas-confetti** for particle effects during winner celebration
- Native Web Audio API for sound effect playback

**Database & ORM**
- **Drizzle ORM** for type-safe database queries
- **drizzle-zod** for schema-to-validation integration
- **@neondatabase/serverless** for Neon PostgreSQL serverless driver
- **drizzle-kit** for migrations and schema management

**Validation**
- **Zod** for runtime type validation and schema definition
- **@hookform/resolvers** for form validation integration
- **zod-validation-error** for user-friendly error messages

**Development Tools**
- **@replit/vite-plugin-runtime-error-modal** for error overlay
- **@replit/vite-plugin-cartographer** for Replit integration
- **@replit/vite-plugin-dev-banner** for development environment indicator

**Third-Party Services**
- **Sound effect URLs** from soundjay.com (drum roll and fanfare)
- No additional third-party API integrations currently implemented

**Build & Deployment**
- **esbuild** for fast server bundling
- **tsx** for TypeScript execution and development
- **Vite** for client bundling and development server