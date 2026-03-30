# SUBMISSION.md — Nova Docs

## Candidate Submission Checklist

| Item | Status |
|---|---|
| Source code (monorepo) | ✅ Included |
| README.md with setup instructions | ✅ Included |
| ARCHITECTURE.md | ✅ Included |
| AI_WORKFLOW.md | ✅ Included |
| SUBMISSION.md | ✅ This file |
| Seeded test accounts | ✅ Included |
| Automated tests | ✅ Included |
| Walkthrough video | ✅ See link below |

---

## Walkthrough Video

> **YouTube Link:** [https://youtu.be/w7fIX3gh4zw](https://youtu.be/w7fIX3gh4zw)
>
> *(Note: I did not have a microphone available, so unfortunately I could not provide an oral walkthrough of the architecture. The video demonstrates the UI workflow and features end-to-end.)*

---

## Test Credentials

Use these seeded accounts to review all flows including sharing:

| User | Email | Password | Role |
|---|---|---|---|
| Alice Demo | alice@demo.com | demo1234 | Owner (has documents) |
| Bob Demo | bob@demo.com | demo1234 | Collaborator |
| Carol Demo | carol@demo.com | demo1234 | Viewer |

---

## What Is Working (End to End)

### Authentication
- User registration with name, email, password (bcrypt hashed)
- Login returns a JWT stored in an `httpOnly` cookie and via Zustand state
- Protected routes redirect unauthenticated users to `/login`
- `/api/auth/me` returns current user from token

### Document Management
- Create new documents (auto-titled "Untitled Document")
- Rename documents inline by clicking the title in the editor header
- Edit document content in the rich text editor
- Auto-save on change with 1500ms debounce — status bar shows "Saving..." → "Saved ✓"
- Delete documents (owner only)
- Documents persist across refresh via SQLite + Prisma

### Rich Text Editor
- Built on **Tiptap v2** (ProseMirror-based)
- Toolbar formatting: Bold, Italic, Underline, H1, H2, H3, Bullet List, Ordered List, Code Block, Undo, Redo
- Editor renders as a **Google Docs-style paginated canvas**: white 816×1056px pages, gray `#E8EAED` canvas background, 96px padding (1 inch margins)
- Page break dividers appear automatically as content overflows to a new page
- Header and toolbar remain completely sticky at the top while scrolling through long documents
- Content stored as Tiptap JSON (not HTML) for reliable formatting persistence

### File Upload
- Upload `.txt`, `.md`, or `.docx` files
- Files are parsed server-side:
  - `.txt` → wrapped in paragraph tags
  - `.md` → parsed via `marked`
  - `.docx` → converted via `mammoth`
- Parsed content becomes a new editable document automatically
- Supported file types and 5MB size limit are clearly handled

### Sharing
- Share any owned document with another user by exact email address
- Choose permission level: **Can View** or **Can Edit**
- Viewers: read-only access, cannot save changes
- Editors: full edit access
- Owner can revoke access from the Share modal collaborator list
- Dashboard shows clear visual distinction: green **Owned** badge vs blue **Shared** badge
- Documents are split into "My Documents" and "Shared With Me" sections on the dashboard
- Backend returns `403 Forbidden` (not 404) for unauthorized document access — prevents enumeration

### Persistence
- All documents, users, and share records stored in SQLite via Prisma
- Database survives server restarts
- Tiptap JSON content restores formatting exactly on reopen
- Sharing relationships persist and are enforced on every API request

### Automated Tests
- Run with: `cd packages/server && pnpm test`
- Core tests cover document creation, sharing logic, access control, and authentication flows.

---

## What Is Incomplete

### Antigravity AI Agent Panel
- **Status:** Scaffolded but disconnected
- The right-side panel renders correctly with quick action buttons (Summarize, Fix Grammar, Continue Writing), message history, and input box
- `useAntigravity.ts` hook is structurally planned
- **Blocked by:** Antigravity API credentials (`ANTIGRAVITY_API_KEY` in `.env`)
- **To complete:** Add the API key to `.env` and wire up the SDK handler

---

## What I Would Build Next (With 2–4 More Hours)

1. **Wire up Antigravity** — plug in the API key and complete the agent SDK integration for document manipulation.
2. **Document version history** — store the last 5 auto-saves per document in a `DocumentVersion` table, add a "Version history" dropdown in the editor header.
3. **Export to Markdown** — add an export button that converts Tiptap JSON → Markdown via `@tiptap/extension-markdown` and triggers a file download.
4. **UI enforcement of view-only mode** — currently the backend enforces viewer permissions; the frontend correctly disables editing, but the UI should visually gray out the toolbar more clearly when the user has view-only access.
5. **Search** — the search bar in the dashboard header is currently UI-only; wire it to a `GET /api/documents?q=` endpoint with a Prisma `contains` filter.

---

## Monorepo Structure

```
nova-docs/
├── packages/
│   ├── server/          # Express + Prisma + TypeScript backend (:3001)
│   │   ├── prisma/      # Schema, migrations, seed
│   │   ├── src/         # Routes, controllers, services, middleware
│   │   └── tests/       # Vitest + Supertest
│   └── client/          # React + Vite + Tiptap frontend (:5173)
│       └── src/         # Pages, components, hooks, store, API layer
├── README.md
├── ARCHITECTURE.md
├── AI_WORKFLOW.md
└── SUBMISSION.md        ← this file
```

---

## Known Limitations

- **No real-time collaboration** — multiple users editing the same document simultaneously will cause last-write-wins on auto-save. This is intentional and out of scope.
- **SQLite in dev** — the database is a local `dev.db` file. For production, swap `DATABASE_URL` to a PostgreSQL connection string; Prisma handles the rest with no code changes.
- **No email delivery** — sharing is done by exact email match against registered users. There is no invite-by-email flow for users who haven't registered yet.
- **File uploads are not stored** — uploaded files are parsed in memory and immediately converted to documents. The original file is not retained after parsing.
