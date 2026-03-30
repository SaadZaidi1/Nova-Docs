# Master Prompt — Claude Opus 4 (Ajaia Docs Build)

---

## How to Use This Prompt

Paste everything below the horizontal rule into a fresh Claude Opus 4 conversation.
Attach `AJAIA_DOCS_REFERENCE.md` to the conversation before sending.
Do not combine modules into one message — send them one at a time in order.

---

---

## INITIAL SYSTEM MESSAGE (Send First)

You are a senior full stack engineer building a production-quality collaborative document editor called **Ajaia Docs**. You are working inside a monorepo using pnpm workspaces.

You have been given a reference document called `AJAIA_DOCS_REFERENCE.md`. This is your single source of truth. Before writing any code, read it in full. Every file path, every route, every DB model, every UI component, and every tech stack decision is defined there. Do not deviate from it without flagging the deviation explicitly.

**Your working constraints:**
- Language: TypeScript everywhere (frontend and backend)
- Frontend: React 18 + Vite + Tailwind CSS v3 + Tiptap v2 + Zustand
- Backend: Node.js + Express + Prisma ORM + SQLite
- Auth: JWT stored in httpOnly cookie
- Testing: Vitest + Supertest
- AI agent: Antigravity (Copilot-like) assists you. Log every meaningful Antigravity assist in `AI_WORKFLOW.md`

**Rules:**
1. Always produce complete, runnable file contents — never truncate with `// ... rest of code`
2. Follow the exact file structure defined in `AJAIA_DOCS_REFERENCE.md`
3. After each module, confirm what is done, what tests pass, and what is next
4. If you make a scope cut, say so explicitly and explain why
5. Validate your own output: before finishing a module, ask "does this match the reference doc?"

Acknowledge these instructions and confirm you have read `AJAIA_DOCS_REFERENCE.md` before proceeding.

---

## MODULE 1 — Project Scaffold & Monorepo Setup

Set up the full monorepo from scratch. Produce all files completely.

**Deliver:**

1. Root `package.json` with pnpm workspace config and a `dev` script that runs both client and server concurrently
2. `pnpm-workspace.yaml`
3. `packages/server/package.json` — all dependencies listed in the reference doc (Express, Prisma, Multer, mammoth, bcrypt, jsonwebtoken, cors, etc.) with TypeScript dev deps
4. `packages/client/package.json` — all dependencies (React, Vite, Tailwind, Tiptap extensions, Zustand, Axios, etc.)
5. `packages/server/tsconfig.json` — strict TypeScript config for Node
6. `packages/client/tsconfig.json` — strict TypeScript config for browser/React
7. `packages/client/vite.config.ts` — with proxy config pointing `/api` to `http://localhost:3001`
8. `packages/client/tailwind.config.ts` — configured for the `src/` directory
9. `packages/server/.env.example` — all env vars from the reference doc
10. `packages/client/.env` — VITE_API_URL set
11. Root `.gitignore` — covering node_modules, dist, .env, dev.db, uploads/

After producing these files, state clearly:
"Scaffold complete. Run `pnpm install` from root to proceed to Module 2."

---

## MODULE 2 — Database Schema, Migrations & Seed

Set up Prisma with SQLite and seed demo accounts.

**Deliver:**

1. `packages/server/src/prisma/schema.prisma` — exact schema from reference doc (User, Document, DocumentShare models)
2. `packages/server/prisma/seed.ts` — creates Alice and Bob accounts, 2 sample documents, 1 share (Alice's "Q3 Planning Notes" shared with Bob as editor). Use bcrypt to hash `demo1234`. Use `prisma.$transaction` for atomicity.
3. `packages/server/src/config.ts` — exports all env vars with type-safe access and throws if required vars are missing
4. `packages/server/src/utils/jwt.ts` — `signToken(userId)` and `verifyToken(token)` utilities
5. `packages/server/src/utils/validation.ts` — Zod schemas for: RegisterInput, LoginInput, CreateDocumentInput, PatchDocumentInput, ShareInput

Show the commands needed to run migration and seed:
```bash
cd packages/server
pnpm prisma migrate dev --name init
pnpm prisma db seed
```

Verify seed by showing what `prisma studio` would display.

---

## MODULE 3 — Auth API

Build the complete auth module on the backend.

**Deliver:**

1. `packages/server/src/middleware/auth.ts` — Express middleware that reads JWT from `Authorization: Bearer` header OR httpOnly cookie named `ajaia_token`, verifies it, attaches `req.user = { id, email, name }` to the request. Returns 401 with `{ error: "Unauthorized" }` if invalid.
2. `packages/server/src/middleware/errorHandler.ts` — global Express error handler that returns `{ error: message, code?: string }` and appropriate HTTP status
3. `packages/server/src/modules/auth/auth.types.ts` — TypeScript interfaces for RegisterInput, LoginInput, AuthResponse, JWTPayload
4. `packages/server/src/modules/auth/auth.service.ts` — `register()` and `login()` functions. Hash passwords with bcrypt (12 rounds). Return JWT on success. Throw typed errors on duplicate email or wrong credentials.
5. `packages/server/src/modules/auth/auth.router.ts` — Express router with POST `/register`, POST `/login`, GET `/me` routes. Validate inputs with Zod. Set httpOnly cookie on login/register. Return `{ token, user }`.
6. `packages/server/src/index.ts` — Express app with cors, cookie-parser, json middleware, and all routers mounted. Listen on PORT from config.

Then write `packages/server/tests/auth.test.ts` with these passing tests:
- POST /auth/register creates user and returns token
- POST /auth/login returns token for valid credentials
- POST /auth/login returns 401 for invalid credentials
- GET /auth/me returns user for valid JWT

---

## MODULE 4 — Documents API

Build the complete documents module.

**Deliver:**

1. `packages/server/src/modules/documents/documents.types.ts` — TypeScript interfaces for Document, DocumentWithOwner, DocumentListItem, PatchDocumentBody
2. `packages/server/src/modules/documents/documents.service.ts` — service functions:
   - `listDocuments(userId)` returns owned documents + documents shared with userId, each flagged with `isOwner: boolean`
   - `createDocument(userId)` creates blank document with title "Untitled Document"
   - `getDocument(documentId, userId)` returns document if user is owner or is in shares. Throws 403 if not.
   - `updateDocument(documentId, userId, data)` updates title and/or content. Only owner or editor-permission shares may update. Throws 403 for viewer-permission.
   - `deleteDocument(documentId, userId)` deletes document. Owner only. Throws 403 otherwise.
3. `packages/server/src/modules/documents/documents.router.ts` — Express router for all 5 document routes. Require auth middleware on all routes. Validate with Zod.

Then write `packages/server/tests/documents.test.ts`:
- Creates document for authenticated user
- Returns only accessible documents in list
- Saves content and updates `updatedAt`
- Returns 403 for unauthorized access attempt

---

## MODULE 5 — Sharing API

Build the sharing module.

**Deliver:**

1. `packages/server/src/modules/sharing/sharing.types.ts` — ShareEntry, CreateShareBody, SharePermission enum
2. `packages/server/src/modules/sharing/sharing.service.ts` — service functions:
   - `getShares(documentId, requestingUserId)` returns list of shares with user name and email. Throws 403 if requester is not owner.
   - `createShare(documentId, ownerUserId, email, permission)` looks up user by email, creates DocumentShare. Throws 404 if email not found, 409 if already shared, 403 if requester is not owner.
   - `revokeShare(documentId, ownerUserId, targetUserId)` deletes DocumentShare. Throws 403 if requester is not owner.
3. `packages/server/src/modules/sharing/sharing.router.ts` — GET, POST, DELETE routes under `/documents/:id/shares`

Then write `packages/server/tests/sharing.test.ts`:
- Grants access to another user by email
- Revokes access successfully
- Returns 403 when non-owner tries to share

---

## MODULE 6 — File Upload API

Build the upload module.

**Deliver:**

1. `packages/server/src/modules/upload/upload.types.ts`
2. `packages/server/src/modules/upload/upload.service.ts`:
   - `processUpload(file, userId)` reads file, converts content to Tiptap-compatible HTML string, creates a new Document record, returns `{ documentId, title }`
   - For `.txt` and `.md`: wrap content in `<p>` tags split by newline
   - For `.docx`: use mammoth to convert to HTML
   - Extract a title from: first line of text content, or filename without extension as fallback
3. `packages/server/src/modules/upload/upload.router.ts`:
   - POST `/upload` with Multer middleware
   - Multer config: dest = `UPLOAD_DIR`, limits = `{ fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 }`, fileFilter = allow only `.txt`, `.md`, `.docx` by mimetype and extension
   - Return 400 with clear message for unsupported file types
   - Return 413 for files over size limit
   - Clean up uploaded file from disk after processing

---

## MODULE 7 — Frontend Foundation

Set up the React frontend, routing, auth state, and API client.

**Deliver:**

1. `packages/client/src/api/client.ts` — Axios instance with `baseURL: import.meta.env.VITE_API_URL`, `withCredentials: true`, request interceptor attaching JWT from Zustand store if present, response interceptor redirecting to `/login` on 401
2. `packages/client/src/api/auth.api.ts` — `register()`, `login()`, `me()` functions
3. `packages/client/src/api/documents.api.ts` — `listDocuments()`, `createDocument()`, `getDocument()`, `updateDocument()`, `deleteDocument()`
4. `packages/client/src/api/sharing.api.ts` — `getShares()`, `createShare()`, `revokeShare()`
5. `packages/client/src/api/upload.api.ts` — `uploadFile(file: File)`
6. `packages/client/src/store/authStore.ts` — Zustand store with `user`, `token`, `login()`, `logout()`, `setUser()` actions. Persist token in localStorage.
7. `packages/client/src/store/documentStore.ts` — Zustand store with `documents`, `currentDocument`, `setDocuments()`, `setCurrentDocument()`, `updateCurrentDocument()`
8. `packages/client/src/types/` — all type files matching the backend types
9. `packages/client/src/App.tsx` — React Router v6 setup with routes: `/login`, `/register`, `/` (dashboard), `/documents/:id` (editor). Wrap protected routes in an `<AuthGuard>` component that checks Zustand auth state.
10. `packages/client/src/pages/LoginPage.tsx` and `RegisterPage.tsx` — clean Google-style auth forms with validation, error display, and loading state

---

## MODULE 8 — Dashboard Page

Build the document dashboard.

**Deliver:**

1. `packages/client/src/components/ui/Button.tsx` — variant: primary (blue), secondary (gray), danger (red). Size: sm, md, lg. Full TypeScript props.
2. `packages/client/src/components/ui/Modal.tsx` — accessible modal with overlay, close on Escape or overlay click, portal rendered
3. `packages/client/src/components/ui/Toast.tsx` — toast notification system with success/error/info variants, auto-dismiss after 4s, stack multiple toasts
4. `packages/client/src/components/ui/Spinner.tsx` — loading spinner in brand blue
5. `packages/client/src/components/layout/AppShell.tsx` — outer layout wrapper used by both Dashboard and Editor. Contains TopBar and optional Sidebar slot.
6. `packages/client/src/components/documents/DocumentCard.tsx` — card showing: title, last edited (relative time), owner name, owned vs shared badge. Click navigates to `/documents/:id`. Three-dot menu with Delete option (owner only).
7. `packages/client/src/components/documents/DocumentList.tsx` — renders two sections: "My Documents" and "Shared with me". Each section renders `DocumentCard` components. Empty state per section.
8. `packages/client/src/pages/DashboardPage.tsx` — fetches documents on mount, renders "New Document" button + "Upload File" button + `DocumentList`. Handle loading and error states.

UI spec:
- Background: `#f1f3f4`
- Cards: white, rounded-lg, shadow-sm, hover:shadow-md
- "New Document" button: blue, left side of header
- Section headers: gray-600, text-sm, font-semibold, uppercase

---

## MODULE 9 — Editor Page

Build the Tiptap editor with full toolbar and Google Docs layout.

**Deliver:**

1. `packages/client/src/components/editor/Toolbar.tsx` — formatting toolbar with all controls listed in the reference doc. Use `useCurrentEditor()` from Tiptap. Each button shows active state (blue background) when the format is applied at cursor position. Group buttons with separator dividers. Tooltip on hover with keyboard shortcut label.

2. `packages/client/src/components/editor/Editor.tsx` — Tiptap `useEditor` hook initialized with StarterKit, Underline, TextAlign, Placeholder, CharacterCount. Accept `content` prop (Tiptap JSON), `editable` boolean, and `onChange(json)` callback. Render `<EditorContent>` with Google Docs document canvas styling (max-w-[816px], white background, shadow, centered).

3. `packages/client/src/components/layout/TopBar.tsx` — Google Docs-style top bar:
   - Left: Ajaia logo + editable document title (click to edit, blur to save, Escape to cancel)
   - Center: save status indicator ("Saving…" / "All changes saved" / "Unsaved changes")
   - Right: Share button (blue) + user avatar with dropdown (logout option)

4. `packages/client/src/pages/EditorPage.tsx`:
   - Fetch document by ID from URL params
   - Show 403 error state if unauthorized
   - Debounce auto-save: 2000ms after last change, PATCH `/documents/:id` with new content
   - Ctrl+S / Cmd+S triggers immediate save
   - Track unsaved state: set to true on change, false after successful save
   - Pass `editable={isOwnerOrEditor}` to Editor (viewers get read-only)

CSS for document canvas to add to index.css:
```css
.ProseMirror {
  min-height: 1056px;
  padding: 96px 96px;
  outline: none;
  font-family: 'Arial', sans-serif;
  font-size: 11pt;
  line-height: 1.5;
  color: #202124;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: #9aa0a6;
  pointer-events: none;
  float: left;
  height: 0;
}
```

---

## MODULE 10 — Sharing Modal & Upload Modal

Build the two remaining feature modals.

**Deliver:**

1. `packages/client/src/components/sharing/ShareModal.tsx`:
   - Opens from TopBar Share button
   - Shows current shares list: avatar initials, name, email, permission badge, revoke button (X) for owner
   - Input: email address field + permission select (Viewer / Editor) + "Share" button
   - Validate email format before submitting
   - Show error if user not found (404) or already shared (409)
   - Success: add share to list without full page reload

2. `packages/client/src/components/sharing/SharedBadge.tsx` — small pill badge reading "Shared with you" in blue, shown on DocumentCards for non-owned documents

3. `packages/client/src/components/upload/UploadModal.tsx`:
   - Opens from Dashboard "Upload File" button
   - Drag-and-drop zone + click to browse
   - Show accepted file types: `.txt`, `.md`, `.docx` clearly in the UI
   - Show file size limit: 5MB
   - Preview selected filename before upload
   - Progress indicator during upload (indeterminate spinner)
   - On success: close modal, navigate to new document in editor
   - On error: show error message in modal (do not close)

---

## MODULE 11 — Final Integration, Polish & README

Wire everything together, fix integration issues, and write deliverable documents.

**Deliver:**

1. Do a complete integration pass:
   - Confirm all API routes match the frontend `api/` calls exactly
   - Confirm auth token flows from login to Zustand to Axios interceptor to API headers
   - Confirm document CRUD reflects immediately in Zustand store and UI
   - Confirm sharing updates are visible without page refresh
   - Confirm upload creates a document and navigates to editor

2. `README.md` — must include:
   - Project overview (2-3 sentences)
   - Prerequisites (Node 18+, pnpm)
   - Step-by-step setup commands
   - Demo credentials (Alice and Bob)
   - How to run tests
   - Known limitations or incomplete areas

3. `ARCHITECTURE.md` — must include:
   - Why Tiptap over other editors
   - Why SQLite + Prisma for this scope
   - Why Zustand over Redux
   - How the sharing permission model works
   - What you would change with more time

4. `AI_WORKFLOW.md` — must include:
   - Which modules Antigravity assisted with
   - Specific examples of accepted vs rejected AI output
   - How correctness was verified
   - Estimated time saved

5. `SUBMISSION.md` — must include:
   - List of all files included
   - What is fully working
   - What is incomplete or simulated
   - What you would build next with 2-4 more hours

6. Run the full test suite and report results:
   ```bash
   pnpm test
   ```
   Expected: 9+ passing tests across auth, documents, and sharing.

---

## FINAL CHECK PROMPT (Send Last)

Review the entire project against `AJAIA_DOCS_REFERENCE.md`. Answer each question explicitly:

1. Does the file structure match the reference exactly?
2. Do all API routes match the reference spec (method, path, request shape, response shape)?
3. Does the Prisma schema match the reference models?
4. Does the editor toolbar include all required formatting options?
5. Do demo accounts Alice and Bob exist and work?
6. Does the sharing model correctly distinguish owner vs viewer vs editor?
7. Does the upload module accept `.txt`, `.md`, `.docx` and reject everything else on both client and server?
8. Are there at least 9 passing automated tests?
9. Are all four deliverable documents (README, ARCHITECTURE, AI_WORKFLOW, SUBMISSION) complete?

For any "No" answer, fix it before considering the build complete.

---

*Prompt version: 1.0 — Paired with AJAIA_DOCS_REFERENCE.md v1.0*