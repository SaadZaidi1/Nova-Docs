# Architecture

## Overview

Ajaia Docs is a monorepo pnpm workspace with two packages:
- **`packages/server`** — Express API with Prisma ORM, JWT auth, and file upload handling
- **`packages/client`** — React SPA with Tiptap editor, Zustand state management, and Tailwind CSS

## Key Architectural Decisions

### Why Tiptap over Other Editors

Tiptap v2 was chosen for several reasons:
1. **ProseMirror foundation** — battle-tested, extensible rich text framework used by production apps like GitLab and Notion
2. **React integration** — first-class React hooks (`useEditor`, `EditorProvider`) with clean component APIs
3. **Extension system** — modular architecture where each formatting feature (bold, headings, lists) is an independent, composable extension
4. **JSON-based content** — stores content as structured JSON rather than HTML, making it versionable, transformable, and database-friendly
5. **Collaborative-ready** — while real-time collab is out of scope, Tiptap's architecture supports Yjs/CRDT integration for future upgrades

Alternatives considered:
- **Slate.js** — more low-level, requires more boilerplate to match Tiptap's out-of-box functionality
- **Quill** — mature but older API, less TypeScript-friendly, harder to customize
- **Draft.js** — Facebook's editor, but maintanence has slowed and community has shifted to alternatives

### Why SQLite + Prisma for This Scope

1. **Zero infrastructure** — SQLite is a file-based database requiring no external server, making local dev and deployment trivial
2. **Prisma ORM** — provides type-safe database access with auto-generated TypeScript types, eliminating SQL injection risks and runtime type errors
3. **Migration system** — Prisma Migrate handles schema versioning and evolution
4. **Appropriate scale** — for a demo/assignment app with <100 users, SQLite handles concurrent reads well and write contention is negligible
5. **Easy portability** — swapping to PostgreSQL/MySQL only requires changing the datasource in `schema.prisma`

### Why Zustand over Redux

1. **Minimal boilerplate** — Zustand stores are plain functions with no reducers, actions, or dispatch ceremony
2. **No Provider wrapper** — stores are accessed via hooks directly, no React context wrapping needed
3. **Built-in selectors** — `useAuthStore(state => state.token)` for granular re-renders
4. **TypeScript-first** — clean generic types without redux-toolkit's complexity
5. **Tiny bundle** — ~1KB vs Redux Toolkit's ~12KB
6. **Appropriate for this scale** — two stores (auth + documents) don't warrant Redux's ecosystem

### Sharing Permission Model

The permission model uses three tiers:
- **Owner** — full control: read, write, delete, share, revoke
- **Editor** — can read and write content/title, cannot delete or manage shares
- **Viewer** — read-only access, cannot modify any document content

Implemented via the `DocumentShare` model with a `permission` field (`"viewer"` | `"editor"`). Every document operation checks:
1. Is the user the document owner? → Full access
2. Does a `DocumentShare` record exist for the user? → Access based on `permission` value
3. Neither → 403 Forbidden

### Frontend Architecture

The frontend follows a clean layered architecture:
```
api/        → Axios HTTP layer (auth, documents, sharing, upload)
store/      → Zustand state management (auth, documents)
hooks/      → Custom hooks composing stores + API calls
components/ → Presentational components (UI, layout, editor, sharing)
pages/      → Route-level pages composing components
```

## What I Would Change With More Time

1. **Real-time collaboration** — integrate Yjs with Tiptap's collaboration extension for live multi-user editing
2. **Document versioning** — store snapshots on each save for history/diff views
3. **Optimistic updates** — update UI immediately and rollback on API failure for snappier UX
4. **Server-side rendering** — move to Next.js for better SEO and initial load performance
5. **PostgreSQL** — switch from SQLite for production-grade concurrency and full-text search
6. **E2E tests** — add Playwright tests for critical user flows
7. **Rate limiting** — add express-rate-limit to prevent abuse
8. **WebSocket notifications** — notify users when documents are shared with them
