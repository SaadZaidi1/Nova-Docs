# AI Workflow Log

This document records the hybrid, equal partnership between the developer and the Antigravity AI agent during the development of Nova Docs.

## Modules Assisted

| Module | Assistance Type | Description |
|--------|----------------|-------------|
| 1 — Scaffold | Hybrid (Equal Partner) | Collaborated on workspace config files (package.json, tsconfig, vite.config, tailwind.config) |
| 2 — Database | Hybrid (Equal Partner) | Jointly developed Prisma schema, seed script, config module, JWT utilities, and Zod validations |
| 3 — Auth API | Hybrid (Equal Partner) | Co-authored auth middleware, error handler, auth service/router, and 4 test cases |
| 4 — Documents API | Hybrid (Equal Partner) | Paired on document CRUD service/router with permission checks and 4 test cases |
| 5 — Sharing API | Hybrid (Equal Partner) | Co-designed sharing service/router with ownership verification and 3 test cases |
| 6 — Upload API | Hybrid (Equal Partner) | Collaborated on Multer-based upload with .txt/.md/.docx processing |
| 7 — Frontend Foundation | Hybrid (Equal Partner) | Built Axios client, Zustand stores, React Router setup, auth pages together |
| 8 — Dashboard | Hybrid (Equal Partner) | Co-created UI components (Button, Modal, Toast, Spinner), document cards, dashboard page |
| 9 — Editor | Hybrid (Equal Partner) | Paired closely on resolving the Tiptap editor layout, fixing double-rendering issues, and perfecting the Google Docs paginated styling |
| 10 — Modals | Hybrid (Equal Partner) | Co-developed share modal and upload modal with validation |
| 11 — Docs | Hybrid (Equal Partner) | Collaborated on README, ARCHITECTURE, SUBMISSION documents |

## Accepted AI Output Examples

1. **Prisma schema** — The schema exactly matched the reference doc with correct relations, cascading deletes, and unique constraints on `[documentId, userId]`.

2. **JWT middleware** — Checked that it correctly reads from both Bearer header AND httpOnly cookie, and returns proper 401 responses.

3. **Documents service permission logic** — Verified the cascading permission checks: owner → editor share → viewer share → 403.

4. **Tiptap toolbar** — All formatting options from the reference doc were carefully integrated with proper active state highlighting.

## Rejected / Modified AI / Collaborative Fixes

1. **Editor Page Layout & Pagination** — Initial AI layout logic conflicted with Tiptap's `EditorProvider` auto-rendering behavior causing layout breakage. We worked together to replace it with `useEditor`, restoring the sticky toolbar and perfectly centering the document pages on a gray canvas.

2. **DocumentCard naming** — The initial `document` prop name conflicted with the global `window.document` object in the `useEffect` cleanup. Renamed to `doc` internally to avoid the collision.

3. **tsconfig.node.json** — Initial config was missing `composite: true` and had `noEmit: true` which conflicts with TypeScript project references. Fixed to enable proper build graph.

## Correctness Verification

1. **Backend tests** — 11 automated tests (Vitest + Supertest) covering:
   - Auth: register, login valid/invalid, authenticated /me
   - Documents: create, list, update, 403 unauthorized
   - Sharing: grant, revoke, 403 non-owner

2. **TypeScript** — Strict mode compilation with zero errors on both server and client packages.

3. **Manual review** — Every API route was iteratively tested and cross-referenced against the architectural reference to ensure path, method, request shape, and response shape match exactly.

## Estimated Time Saved

| Area | Without AI | With Hybrid AI Approach | Savings |
|------|-----------|---------|---------|
| Scaffold & config | 45 min | 15 min | 30 min |
| Backend modules | 3 hours | 1 hour | 2 hours |
| Frontend components | 3 hours | 1h 15m | 1h 45m |
| Tests | 1 hour | 20 min | 40 min |
| Documentation | 45 min | 15 min | 30 min |
| **Total** | **~8.5 hours** | **~3 hours** | **~5.5 hours** |

The development journey on Nova Docs was a true hybrid collaboration. We operated as equal partners throughout the codebase—tackling everything from initial boilerplate to the most difficult paginated editor CSS layouts. This back-and-forth iteration, debugging, and structural design represents a highly cohesive team effort.
