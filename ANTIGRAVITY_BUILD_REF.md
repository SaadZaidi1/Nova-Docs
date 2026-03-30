# Ajaia Collaborative Document Editor — Build Reference

> This file is the single source of truth for the Ajaia docs project.
> Claude Opus should refer back to this document at every module boundary.
> Do not deviate from the architecture, file structure, or tech stack defined here without explicitly flagging it.

---

## Project Overview

Build a lightweight collaborative document editor inspired by Google Docs. The product must support document creation/editing, file upload, document sharing between users, and full persistence. The UI must feel like Google Docs — clean, toolbar-driven, document-centric.

**Timebox:** 4–6 hours of focused engineering.
**AI Agent:** Antigravity (Copilot-like agent) assists during development. All AI output must be reviewed and verified before committing.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS v3 |
| Rich Text Editor | Tiptap v2 (ProseMirror-based) |
| Backend | Node.js + Express (TypeScript) |
| Database | SQLite via Prisma ORM |
| Auth | JWT (stateless, cookie-stored) |
| File Handling | Multer (uploads) + mammoth (docx→html) |
| Testing | Vitest (unit) + Supertest (API) |
| Build Tool | Vite (frontend) |
| Package Manager | pnpm (monorepo workspaces) |

---

## Repository Structure

```
ajaia-docs/
├── README.md
├── ARCHITECTURE.md
├── AI_WORKFLOW.md
├── SUBMISSION.md
├── AJAIA_DOCS_REFERENCE.md          ← this file
├── package.json                      ← pnpm workspace root
├── pnpm-workspace.yaml
│
├── packages/
│   ├── server/                       ← Express API
│   │   ├── src/
│   │   │   ├── index.ts              ← app entry, middleware setup
│   │   │   ├── config.ts             ← env vars, constants
│   │   │   ├── prisma/
│   │   │   │   └── schema.prisma     ← DB schema
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts           ← JWT verify middleware
│   │   │   │   └── errorHandler.ts   ← global error handler
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.router.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   └── auth.types.ts
│   │   │   │   ├── documents/
│   │   │   │   │   ├── documents.router.ts
│   │   │   │   │   ├── documents.service.ts
│   │   │   │   │   └── documents.types.ts
│   │   │   │   ├── sharing/
│   │   │   │   │   ├── sharing.router.ts
│   │   │   │   │   ├── sharing.service.ts
│   │   │   │   │   └── sharing.types.ts
│   │   │   │   └── upload/
│   │   │   │       ├── upload.router.ts
│   │   │   │       ├── upload.service.ts
│   │   │   │       └── upload.types.ts
│   │   │   └── utils/
│   │   │       ├── jwt.ts
│   │   │       └── validation.ts
│   │   ├── tests/
│   │   │   ├── auth.test.ts
│   │   │   ├── documents.test.ts
│   │   │   └── sharing.test.ts
│   │   ├── prisma/
│   │   │   └── dev.db                ← SQLite file (gitignored)
│   │   ├── uploads/                  ← uploaded files (gitignored)
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── .env.example
│   │
│   └── client/                       ← React + TypeScript frontend
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── vite-env.d.ts
│       │   ├── api/
│       │   │   ├── client.ts         ← axios instance with interceptors
│       │   │   ├── auth.api.ts
│       │   │   ├── documents.api.ts
│       │   │   ├── sharing.api.ts
│       │   │   └── upload.api.ts
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   │   ├── AppShell.tsx  ← top nav + sidebar wrapper
│       │   │   │   ├── Sidebar.tsx   ← document list panel
│       │   │   │   └── TopBar.tsx    ← Google Docs-style top bar
│       │   │   ├── editor/
│       │   │   │   ├── Editor.tsx    ← Tiptap editor wrapper
│       │   │   │   ├── Toolbar.tsx   ← formatting toolbar
│       │   │   │   └── EditorPage.tsx← full editor page
│       │   │   ├── documents/
│       │   │   │   ├── DocumentCard.tsx
│       │   │   │   ├── DocumentList.tsx
│       │   │   │   └── NewDocumentButton.tsx
│       │   │   ├── sharing/
│       │   │   │   ├── ShareModal.tsx
│       │   │   │   └── SharedBadge.tsx
│       │   │   ├── upload/
│       │   │   │   └── UploadModal.tsx
│       │   │   └── ui/
│       │   │       ├── Button.tsx
│       │   │       ├── Input.tsx
│       │   │       ├── Modal.tsx
│       │   │       ├── Spinner.tsx
│       │   │       └── Toast.tsx
│       │   ├── hooks/
│       │   │   ├── useAuth.ts
│       │   │   ├── useDocuments.ts
│       │   │   ├── useEditor.ts
│       │   │   └── useSharing.ts
│       │   ├── pages/
│       │   │   ├── LoginPage.tsx
│       │   │   ├── RegisterPage.tsx
│       │   │   ├── DashboardPage.tsx
│       │   │   └── EditorPage.tsx
│       │   ├── store/
│       │   │   ├── authStore.ts      ← Zustand auth slice
│       │   │   └── documentStore.ts  ← Zustand documents slice
│       │   ├── types/
│       │   │   ├── document.types.ts
│       │   │   ├── user.types.ts
│       │   │   └── api.types.ts
│       │   └── utils/
│       │       ├── formatDate.ts
│       │       └── classNames.ts
│       ├── public/
│       ├── index.html
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── tailwind.config.ts
│       └── package.json
```

---

## Database Schema (Prisma)

```prisma
model User {
  id           String        @id @default(cuid())
  email        String        @unique
  name         String
  passwordHash String
  createdAt    DateTime      @default(now())
  documents    Document[]    @relation("DocumentOwner")
  sharedWith   DocumentShare[]
}

model Document {
  id        String          @id @default(cuid())
  title     String          @default("Untitled Document")
  content   String          @default("")   // Tiptap JSON as string
  ownerId   String
  owner     User            @relation("DocumentOwner", fields: [ownerId], references: [id])
  shares    DocumentShare[]
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt
}

model DocumentShare {
  id         String   @id @default(cuid())
  documentId String
  userId     String
  permission String   @default("viewer")  // "viewer" | "editor"
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id])
  createdAt  DateTime @default(now())

  @@unique([documentId, userId])
}
```

---

## API Routes

### Auth
```
POST   /api/auth/register     → { name, email, password } → { token, user }
POST   /api/auth/login        → { email, password }        → { token, user }
GET    /api/auth/me           → (JWT required)             → { user }
```

### Documents
```
GET    /api/documents         → list owned + shared documents
POST   /api/documents         → create new blank document
GET    /api/documents/:id     → get single document (if owner or shared)
PATCH  /api/documents/:id     → update title or content
DELETE /api/documents/:id     → delete (owner only)
```

### Sharing
```
GET    /api/documents/:id/shares         → list shares for a document
POST   /api/documents/:id/shares         → { email, permission } → grant access
DELETE /api/documents/:id/shares/:userId → revoke access
```

### Upload
```
POST   /api/upload            → multipart/form-data (file) → creates new Document
                                Accepted types: .txt, .md, .docx
                                Returns: { documentId, title }
```

---

## Feature List

### Module 1 — Auth
- [x] Register with name, email, password
- [x] Login with email, password
- [x] JWT stored in httpOnly cookie
- [x] Protected routes on both FE and BE
- [x] Two seeded demo accounts: `alice@demo.com` / `bob@demo.com` (password: `demo1234`)

### Module 2 — Document CRUD
- [x] Create blank document (auto-title "Untitled Document")
- [x] Rename document inline (click title in editor, edit in place)
- [x] Auto-save content every 2 seconds after last keystroke (debounced)
- [x] Manual save via Ctrl+S / Cmd+S
- [x] Delete document (owner only, with confirm dialog)
- [x] Reopen saved document with full formatting preserved

### Module 3 — Rich Text Editor (Tiptap v2)
Must support these formatting options via toolbar:
- [x] Bold (Ctrl+B)
- [x] Italic (Ctrl+I)
- [x] Underline (Ctrl+U)
- [x] Strikethrough
- [x] Heading 1, Heading 2, Heading 3
- [x] Bullet list
- [x] Ordered (numbered) list
- [x] Blockquote
- [x] Code block
- [x] Undo / Redo
- [x] Text alignment (left, center, right)

Tiptap extensions to install:
```
@tiptap/starter-kit
@tiptap/extension-underline
@tiptap/extension-text-align
@tiptap/extension-placeholder
@tiptap/extension-character-count
```

### Module 4 — File Upload
- [x] Upload modal accessible from dashboard and editor
- [x] Accepted types: `.txt`, `.md`, `.docx` only (enforce both client and server)
- [x] `.txt` and `.md` → wrap plain text in Tiptap paragraph nodes
- [x] `.docx` → convert to HTML with `mammoth`, then import into Tiptap
- [x] File size limit: 5MB (enforce server-side via Multer)
- [x] Show clear error if unsupported type or oversized file
- [x] On success → navigate to the new document in the editor

### Module 5 — Sharing
- [x] Share button in editor top bar (Google Docs-style)
- [x] ShareModal: input an email address + select permission (Viewer / Editor)
- [x] Shared documents appear in sidebar under "Shared with me" section
- [x] Owner documents appear under "My Documents" section
- [x] SharedBadge on document cards that are shared with the current user
- [x] Revoke access from the ShareModal (owner only)
- [x] Editor-permission shared users can edit; viewer-permission users see read-only editor

### Module 6 — Dashboard
- [x] List of all accessible documents (owned + shared)
- [x] "New Document" button (prominent, top of list)
- [x] "Upload File" button
- [x] Document cards with: title, last edited date, owner name, owned/shared badge
- [x] Empty state illustration when no documents exist

---

## UI Design Specification

### Overall Aesthetic
- Mimic Google Docs as closely as possible within scope
- White canvas with subtle drop shadow for the document area
- Light gray (#f1f3f4) application background
- Blue (#1a73e8) as primary action color
- Inter or Google Sans as the font family

### Top Bar (Editor)
```
[ Ajaia Logo ] [ Document Title (editable) ]    [ Save Status ] [ Share Button ] [ Avatar ]
```
- Title click → inline input for renaming
- Save status: "Saving…" / "Saved" / "Unsaved changes"
- Share button: blue, right side

### Toolbar (Editor)
```
[ Undo | Redo ] | [ Bold | Italic | Underline | Strike ] | [ H1 | H2 | H3 ] | [ Bullet | Ordered ] | [ Align ] | [ Quote | Code ]
```
- Google Docs-style icon buttons with hover states
- Active state = blue highlight on button
- Separator `|` between groups

### Sidebar (Dashboard)
```
┌─────────────────┐
│ 📄 My Documents │
│   Doc Title     │
│   Doc Title     │
├─────────────────┤
│ 👥 Shared       │
│   Doc Title     │
└─────────────────┘
```

### Document Canvas
- Max width: 816px (standard US Letter width equivalent in px)
- Vertical padding: 96px top and bottom
- White background, 1px border with shadow
- Centered in the viewport

---

## Validation & Error Handling Rules

1. **All API errors** must return `{ error: string, code?: string }` with appropriate HTTP status
2. **Client** must display a Toast on all API errors
3. **Auth errors** (401) must redirect to `/login`
4. **Form validation** must happen client-side before API calls
5. **Upload validation** must happen both client-side (file type check) and server-side (Multer limits + type check)
6. **Document access** — if a user tries to access a doc they don't own and aren't shared on, return 403

---

## Testing Requirements (Minimum)

Write at minimum these tests using Vitest + Supertest:

```
tests/
  auth.test.ts
    ✓ POST /auth/register creates user and returns token
    ✓ POST /auth/login returns token for valid credentials
    ✓ POST /auth/login returns 401 for invalid credentials

  documents.test.ts
    ✓ POST /documents creates a new document for authenticated user
    ✓ GET /documents returns only owned + shared documents
    ✓ PATCH /documents/:id saves content and updates updatedAt
    ✓ GET /documents/:id returns 403 for unauthorized user

  sharing.test.ts
    ✓ POST /documents/:id/shares grants access to another user
    ✓ DELETE /documents/:id/shares/:userId revokes access
```

---

## Seeded Demo Accounts

These must be created by a Prisma seed script (`prisma/seed.ts`):

| Name | Email | Password | Role |
|---|---|---|---|
| Alice Demo | alice@demo.com | demo1234 | Owner of 2 sample docs |
| Bob Demo | bob@demo.com | demo1234 | Shared on Alice's doc |

Sample documents:
- "Q3 Planning Notes" — owned by Alice, shared with Bob (editor)
- "Product Roadmap Draft" — owned by Alice, not shared

---

## Environment Variables

### Server `.env`
```
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="ajaia-super-secret-dev-key"
JWT_EXPIRES_IN="7d"
PORT=3001
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE_MB=5
CLIENT_URL="http://localhost:5173"
```

### Client `.env`
```
VITE_API_URL=http://localhost:3001/api
```

---

## Build & Run Instructions

```bash
# Install dependencies
pnpm install

# Setup database
cd packages/server
pnpm prisma migrate dev --name init
pnpm prisma db seed

# Run both server and client in dev mode (from root)
pnpm dev

# Run tests
pnpm test
```

---

## Scope Cuts (Do NOT build these)

The following are explicitly out of scope for this timebox. Do not attempt them unless all core modules are complete and tested:

- Real-time collaboration (WebSockets / CRDTs)
- Comments or suggestion mode
- Document version history
- Export to PDF or Markdown
- Role-based permissions beyond viewer/editor
- Image embedding in documents
- Google OAuth
- Email notifications for share invitations

---

## Stretch Goals (Only if core is 100% complete)

Pick at most ONE:

1. **Version history** — store snapshots on each save, allow restoring a previous version
2. **Export to Markdown** — convert Tiptap JSON to `.md` and download
3. **Document search** — filter documents by title on the dashboard

---

## Antigravity Agent Usage Guidelines

Antigravity is a Copilot-like AI agent assisting during development. Follow these rules:

1. **Use Antigravity for:** boilerplate generation, Prisma schema setup, Tiptap extension wiring, Tailwind component structure, test scaffolding
2. **Do NOT blindly accept:** auth logic (verify JWT handling), any SQL/Prisma query touching permissions, file upload validation (verify both client and server enforce types)
3. **Always verify:** that Antigravity-generated API calls match the route definitions in this document exactly
4. **Reject if:** Antigravity suggests a different DB (use SQLite/Prisma only), a different editor (use Tiptap only), or a different state manager (use Zustand only)
5. **Log every significant Antigravity assist** in `AI_WORKFLOW.md`

---

## Deliverables Checklist

- [ ] `README.md` with local setup instructions
- [ ] `ARCHITECTURE.md` — what was built and key decisions
- [ ] `AI_WORKFLOW.md` — Antigravity usage log
- [ ] `SUBMISSION.md` — list of what is included, what is incomplete, what is next
- [ ] Source code in `packages/server` and `packages/client`
- [ ] Prisma seed script with demo accounts
- [ ] At least 9 passing automated tests
- [ ] Walkthrough video URL (Loom or YouTube, unlisted)
- [ ] Screenshots or demo GIF

---

*Reference version: 1.0 — Generated for Ajaia engineering assignment*