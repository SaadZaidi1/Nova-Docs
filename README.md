# Nova Docs

A lightweight collaborative document editor inspired by Google Docs, built with React, TypeScript, Tiptap, Express, and Prisma. Supports document creation/editing, file upload, document sharing between users, and full persistence.

## Prerequisites

- **Node.js** ≥ 18 (tested on v20+)
- **pnpm** ≥ 9 — install globally if you don't have it:

```bash
npm install -g pnpm
```

## Quick Start (One Command)

> All commands below are run **from the project root directory** (`ajaia-assignment/`).

### 1. Install dependencies

```bash
pnpm install
```

> **Note:** pnpm may ask you to approve build scripts for Prisma, bcrypt, and esbuild.
> If you see a "pnpm approve-builds" prompt, select all packages (`a`) and confirm (`y`).
> Alternatively, this is pre-configured in `pnpm-workspace.yaml`.

### 2. Set up environment variables

Copy the example `.env` files (these are already pre-filled for local dev):

```bash
cp packages/server/.env.example packages/server/.env
cp packages/client/.env.example packages/client/.env
```

**Server** (`packages/server/.env`):
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="ajaia-super-secret-dev-key"
JWT_EXPIRES_IN="7d"
PORT=3001
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE_MB=5
CLIENT_URL="http://localhost:5173"
```

**Client** (`packages/client/.env`):
```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Initialize the database

```bash
pnpm --filter server exec prisma migrate dev --name init
```

This creates the SQLite database, runs all migrations, generates the Prisma client, **and** runs the seed script (Alice + Bob demo accounts with sample documents).

> **If seeding didn't run automatically**, run it manually:
> ```bash
> pnpm --filter server exec prisma db seed
> ```

### 4. Start the development servers

```bash
pnpm dev
```

This runs both the backend and frontend concurrently via `concurrently`:

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:5173  |
| Backend  | http://localhost:3001  |

#### Alternative: start servers individually

```bash
# Terminal 1 — Backend
pnpm --filter server dev

# Terminal 2 — Frontend
pnpm --filter client dev
```

## Demo Credentials

| Name       | Email           | Password   |
|------------|-----------------|------------|
| Alice Demo | alice@demo.com  | demo1234   |
| Bob Demo   | bob@demo.com    | demo1234   |

Alice owns two sample documents:
- **"Q3 Planning Notes"** — shared with Bob (editor permission)
- **"Product Roadmap Draft"** — not shared

## Running Tests

```bash
# From the project root:
pnpm test
```

Expected output: **11 passing tests** across auth (4), documents (4), and sharing (3).

```
 ✓ tests/auth.test.ts (4)
 ✓ tests/documents.test.ts (4)
 ✓ tests/sharing.test.ts (3)

 Test Files  3 passed (3)
      Tests  11 passed (11)
```

## Tech Stack

| Layer          | Technology                       |
|----------------|----------------------------------|
| Frontend       | React 18 + TypeScript + Vite     |
| Styling        | Tailwind CSS v3                  |
| Rich Text      | Tiptap v2 (ProseMirror-based)    |
| Backend        | Node.js + Express + TypeScript   |
| Database       | SQLite via Prisma ORM            |
| Auth           | JWT (stateless, cookie-stored)   |
| File Handling  | Multer + mammoth (docx→html)     |
| Testing        | Vitest + Supertest               |
| Package Manager| pnpm (monorepo workspaces)       |

## Project Structure

```
ajaia-assignment/
├── packages/
│   ├── server/              ← Express API
│   │   ├── prisma/          ← Schema, migrations, seed
│   │   ├── src/
│   │   │   ├── modules/     ← auth, documents, sharing, upload
│   │   │   ├── middleware/  ← auth, errorHandler
│   │   │   └── utils/       ← jwt, validation
│   │   ├── tests/           ← Vitest + Supertest
│   │   ├── .env.example
│   │   └── package.json
│   └── client/              ← React SPA
│       ├── src/
│       │   ├── api/         ← Axios HTTP layer
│       │   ├── components/  ← UI, layout, editor, sharing
│       │   ├── hooks/       ← useAuth, useDocuments, useEditor, useSharing, usePageBreaks
│       │   ├── pages/       ← Login, Register, Dashboard, Editor
│       │   ├── store/       ← Zustand (auth, documents)
│       │   └── types/       ← TypeScript interfaces
│       ├── .env.example
│       └── package.json
├── package.json             ← pnpm workspace root (dev, test, build scripts)
└── pnpm-workspace.yaml
```

## Troubleshooting

**Port already in use?** Kill stale processes:
```bash
# Linux/macOS
fuser -k 3001/tcp 5173/tcp
```

**Prisma client not generated?**
```bash
pnpm --filter server exec prisma generate
```

**Database out of sync?** Reset and re-seed:
```bash
pnpm --filter server exec prisma migrate reset
```

## Known Limitations

- No real-time collaboration (WebSockets/CRDTs are out of scope)
- No document version history
- No comments or suggestion mode
- No export to PDF/Markdown
- No Google OAuth
- No email notifications for share invitations
