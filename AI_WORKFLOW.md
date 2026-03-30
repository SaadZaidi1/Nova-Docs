# AI Workflow Log

This document records how the Antigravity AI agent assisted during the development of Ajaia Docs.

## Modules Assisted

| Module | Assistance Type | Description |
|--------|----------------|-------------|
| 1 — Scaffold | Full generation | Generated all workspace config files (package.json, tsconfig, vite.config, tailwind.config) |
| 2 — Database | Full generation | Generated Prisma schema, seed script, config module, JWT utilities, and Zod validations |
| 3 — Auth API | Full generation | Generated auth middleware, error handler, auth service/router, and 4 test cases |
| 4 — Documents API | Full generation | Generated document CRUD service/router with permission checks and 4 test cases |
| 5 — Sharing API | Full generation | Generated sharing service/router with ownership verification and 3 test cases |
| 6 — Upload API | Full generation | Generated Multer-based upload with .txt/.md/.docx processing |
| 7 — Frontend Foundation | Full generation | Generated Axios client, Zustand stores, React Router setup, auth pages |
| 8 — Dashboard | Full generation | Generated UI components (Button, Modal, Toast, Spinner), document cards, dashboard page |
| 9 — Editor | Full generation | Generated Tiptap editor with toolbar, Google Docs canvas styling, auto-save |
| 10 — Modals | Full generation | Generated share modal and upload modal with validation |
| 11 — Docs | Full generation | Generated README, ARCHITECTURE, SUBMISSION documents |

## Accepted AI Output Examples

1. **Prisma schema** — Accepted as-is. The schema exactly matched the reference doc with correct relations, cascading deletes, and unique constraints on `[documentId, userId]`.

2. **JWT middleware** — Accepted with verification. Checked that it correctly reads from both Bearer header AND httpOnly cookie, and returns proper 401 responses.

3. **Documents service permission logic** — Accepted after review. Verified the cascading permission checks: owner → editor share → viewer share → 403.

4. **Tiptap toolbar** — Accepted. All formatting options from the reference doc are included with proper active state highlighting.

## Rejected / Modified AI Output Examples

1. **DocumentCard naming** — The initial `document` prop name conflicted with the global `window.document` object in the `useEffect` cleanup. Renamed to `doc` internally to avoid the collision.

2. **Editor component** — Initial version had unused imports (`useEditor`, `useEffect`) and an `EditorInner` subcomponent that wasn't needed since `EditorProvider` handles context internally. Simplified to a single component.

3. **tsconfig.node.json** — Initial config was missing `composite: true` and had `noEmit: true` which conflicts with TypeScript project references. Fixed to enable proper build graph.

## Correctness Verification

1. **Backend tests** — 11 automated tests (Vitest + Supertest) covering:
   - Auth: register, login valid/invalid, authenticated /me
   - Documents: create, list, update, 403 unauthorized
   - Sharing: grant, revoke, 403 non-owner

2. **TypeScript** — Strict mode compilation with zero errors on both server and client packages.

3. **Manual review** — Every API route was cross-referenced against `AJAIA_DOCS_REFERENCE.md` to ensure path, method, request shape, and response shape match exactly.

## Estimated Time Saved

| Area | Without AI | With AI | Savings |
|------|-----------|---------|---------|
| Scaffold & config | 45 min | 10 min | 35 min |
| Backend modules | 3 hours | 45 min | 2h 15m |
| Frontend components | 3 hours | 50 min | 2h 10m |
| Tests | 1 hour | 15 min | 45 min |
| Documentation | 45 min | 10 min | 35 min |
| **Total** | **~8.5 hours** | **~2.5 hours** | **~6 hours** |

The AI agent was most impactful in generating boilerplate (config files, type definitions, CRUD operations) and scaffolding well-structured components. Human review was critical for permission logic, error handling edge cases, and TypeScript compatibility issues.
