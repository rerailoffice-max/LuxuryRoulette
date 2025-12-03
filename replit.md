# 抽選ルーレット (Lucky Draw Roulette)

## Overview

これは余興やパーティー向けに設計された華やかな抽選ルーレットアプリケーションです。ドラマチックなアニメーション、効果音、紙吹雪の演出で、ゲームショーのような体験を提供します。参加者名のコピペ入力、自動敬称削除、参加者プレビュー画面、抽選アニメーションなどの機能を備えています。UIは完全に日本語でローカライズされています。

## Key Features

### 日本語対応 (Japanese Localization)
- 完全に日本語化されたUI（タイトル、ボタン、メッセージ、プレースホルダー）
- 敬称自動削除機能（さん、様、君、ちゃん、殿、氏 などを自動で除去）
- 日本語でのCSV出力・クリップボードコピー

### 参加者プレビュー画面 (Preview Screen)
- 抽選開始前に全参加者を一覧表示
- 参加者のエントリー確認と期待感を高める演出
- 「戻って編集」ボタンで名簿の修正が可能

### Application Flow
1. **セットアップ画面**: 参加者名を入力（1行に1名）
2. **プレビュー画面**: 参加者一覧を確認
3. **抽選中**: ドラムロールとともに名前が回転
4. **当選発表**: 紙吹雪とファンファーレで当選者を祝福

### 当選履歴 (Winner History & Export)
- 全当選者の履歴を回数と時刻付きで記録
- CSVファイルとしてエクスポート可能
- クリップボードにコピー機能
- 履歴クリア機能

### ルーレット設定 (Roulette Settings)
- 回転時間の調整（2〜10秒）
- 3段階のスピード設定（速い、普通、ゆっくり）
- セッション中は設定を保持

### テーマ (Visual Themes)
- **ゴールデン** (デフォルト): 金色をベースにした温かみのあるテーマ
- **カジノ**: 赤と金のカジノ風テーマ
- **パーティー**: ピンクと紫のカラフルなテーマ
- **ビジネス**: 青をベースにしたプロフェッショナルなテーマ

### 効果音設定 (Sound Effects)
- カスタムドラムロール音のアップロード（MP3/WAV/OGG、最大10MB）
- カスタムファンファーレ音のアップロード
- 試聴機能付き
- デフォルト音への復元可能

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
- Four distinct application states: Setup → Preview → Spinning → Winner celebration
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