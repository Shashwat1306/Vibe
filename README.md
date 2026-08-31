<p align="center">
  <img src="public/logo.svg" alt="Vibe Logo" width="60" />
</p>

<h1 align="center">Vibe</h1>

<p align="center">
  <strong>Build apps and websites by chatting with AI</strong>
</p>

<p align="center">
  An AI-powered full-stack web application builder that lets you describe what you want in natural language and watches it come to life — complete with a live preview, file explorer, and iterative refinement through conversation.
</p>

---

## ✨ Overview

**Vibe** turns natural language descriptions into fully functional Next.js web applications in real time. Users sign in, describe what they want to build (or pick from curated templates), and a multi-agent AI pipeline powered by **Google Gemini** generates production-quality code inside a secure cloud sandbox (**E2B**). The result is instantly rendered as a live preview alongside an interactive file explorer with syntax highlighting.

### Key Capabilities

- 🤖 **Conversational Code Generation** — Describe features in plain English; the AI writes complete, production-ready code
- 👁️ **Live Preview** — See your app running in real time via an embedded iframe connected to a cloud sandbox
- 🗂️ **File Explorer & Code View** — Browse the generated file tree with PrismJS syntax highlighting
- 🔄 **Iterative Refinement** — Continue the conversation to add features, fix bugs, or redesign components
- 🎨 **Curated Templates** — Start from popular templates (Netflix clone, Kanban board, Spotify clone, and more)
- 🔐 **Authentication & Billing** — Google sign-in via Clerk with Free and Pro tier credit limits
- 🌗 **Theme Support** — Light, dark, and system theme modes

---

## 🛠️ Tech Stack

### Frontend & Framework
| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) (App Router) | Full-stack React framework with Turbopack |
| [React 19](https://react.dev/) | UI library with Server Components |
| [TypeScript 5](https://www.typescriptlang.org/) | Type-safe development |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [Shadcn UI](https://ui.shadcn.com/) (New York style) | Component library built on Radix UI primitives |
| [Lucide React](https://lucide.dev/) | Icon library |
| [PrismJS](https://prismjs.com/) | Syntax highlighting in the code explorer |
| [Sonner](https://sonner.emilkowal.dev/) | Toast notifications |
| [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) | Resizable split-pane layout |

### Backend & API
| Technology | Purpose |
|---|---|
| [tRPC v11](https://trpc.io/) | End-to-end type-safe API layer |
| [TanStack React Query v5](https://tanstack.com/query) | Data fetching, caching, and server state |
| [SuperJSON](https://github.com/blitz-js/superjson) | Rich serialization across network boundaries |
| [Zod](https://zod.dev/) | Schema validation for inputs and environment variables |

### Database
| Technology | Purpose |
|---|---|
| [PostgreSQL](https://www.postgresql.org/) (hosted on [Neon](https://neon.tech/)) | Primary relational database |
| [Prisma 7](https://www.prisma.io/) | ORM with type-safe database client |

### AI & Agent Orchestration
| Technology | Purpose |
|---|---|
| [Inngest](https://www.inngest.com/) | Event-driven background job orchestration |
| [@inngest/agent-kit](https://www.inngest.com/docs/agent-kit) | Multi-agent network with tool calling and state management |
| [Google Gemini 2.5 Flash](https://ai.google.dev/) | Large language model for code generation |
| [E2B Code Interpreter](https://e2b.dev/) | Secure cloud sandbox (Linux microVM) for running generated apps |

### Authentication & Billing
| Technology | Purpose |
|---|---|
| [Clerk](https://clerk.com/) | Authentication (Google OAuth), user management, and pricing tiers |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User's Browser                              │
│  ┌──────────────────────┐   ┌──────────────────────────────────┐   │
│  │    Chat Panel        │   │     Preview / Code Panel         │   │
│  │  • Message history   │   │  • Live iframe (E2B sandbox)     │   │
│  │  • Prompt input      │   │  • File tree with syntax viewer  │   │
│  │  • Template picker   │   │  • Tab switching (Demo / Code)   │   │
│  └──────────┬───────────┘   └───────────────┬──────────────────┘   │
│             │                               │                       │
└─────────────┼───────────────────────────────┼───────────────────────┘
              │  tRPC mutations               │  iframe src
              ▼                               ▼
┌─────────────────────────┐     ┌──────────────────────────────┐
│    Next.js App Server   │     │    E2B Cloud Sandbox         │
│  • tRPC API routes      │     │  • Next.js dev server (3000) │
│  • Clerk auth middleware│     │  • Hot-reloading enabled      │
│  • Inngest webhook      │     │  • File system access         │
└────────────┬────────────┘     └──────────────▲───────────────┘
             │                                 │
             │  inngest.send()                 │ terminal / file ops
             ▼                                 │
┌─────────────────────────┐     ┌──────────────┴───────────────┐
│    Inngest Agent Runner │────▶│  Code Agent (Gemini 2.5)     │
│  • Step-based workflow  │     │  • createOrUpdateFiles tool   │
│  • State management     │     │  • terminal tool              │
│  • Max 15 iterations    │     │  • readFiles tool             │
└────────────┬────────────┘     └──────────────────────────────┘
             │
             │  Result persistence
             ▼
┌─────────────────────────┐
│   PostgreSQL (Neon)     │
│  • Projects             │
│  • Messages             │
│  • Fragments (files,    │
│    sandbox URL, title)  │
│  • Usage (rate limits)  │
└─────────────────────────┘
```

---

## 📁 Project Structure

```
vibe/
├── app/                            # Next.js App Router
│   ├── (home)/                     # Home route group (shared layout with Navbar)
│   │   ├── layout.tsx              # Navbar + radial dot background
│   │   ├── page.tsx                # Landing: hero, project form, project list
│   │   ├── pricing/page.tsx        # Clerk PricingTable with theme support
│   │   ├── sign-in/[[...sign-in]]/ # Clerk SignIn page
│   │   └── sign-up/[[...sign-up]]/ # Clerk SignUp page
│   ├── api/
│   │   ├── inngest/route.ts        # Inngest webhook handler (GET/POST/PUT)
│   │   └── trpc/[trpc]/            # tRPC API endpoint
│   ├── projects/[projectId]/       # Project workspace (chat + preview)
│   ├── error.tsx                   # Global error boundary
│   ├── globals.css                 # Tailwind v4 theme & base styles
│   └── layout.tsx                  # Root: ClerkProvider, tRPC, ThemeProvider
│
├── components/                     # Shared UI components
│   ├── code-view/                  # PrismJS syntax highlighter + theme CSS
│   ├── file-explorer.tsx           # Resizable file tree + code viewer
│   ├── tree-view.tsx               # Hierarchical folder/file sidebar tree
│   ├── hint.tsx                    # Tooltip wrapper component
│   ├── user-control.tsx            # Clerk UserButton wrapper
│   └── ui/                         # ~56 Shadcn UI primitives
│
├── hooks/                          # Custom React hooks
│   ├── use-current-theme.ts        # Resolves current theme (handles 'system')
│   ├── use-mobile.ts               # Viewport detection (< 768px)
│   └── use-scroll.ts               # Scroll position threshold detector
│
├── inngest/                        # Background AI agent orchestration
│   ├── client.ts                   # Inngest client initialization
│   ├── functions.ts                # Multi-agent code generation workflow
│   └── utils.ts                    # Sandbox reconnection & text extraction
│
├── lib/                            # Shared libraries & utilities
│   ├── db.ts                       # Prisma client singleton (pg Pool adapter)
│   ├── usage.ts                    # Rate limiter (Free: 5 / Pro: 100 credits)
│   └── utils.ts                    # cn() helper + file-to-tree converter
│
├── modules/                        # Feature-driven domain modules
│   ├── home/                       # Landing page templates & UI components
│   │   ├── constants.ts            # 8 curated project templates
│   │   └── ui/components/          # Navbar, ProjectForm, ProjectsList
│   ├── messages/
│   │   └── server/procedures.ts    # tRPC: getMany, create (with Inngest trigger)
│   ├── projects/
│   │   ├── server/procedures.ts    # tRPC: getOne, getMany, create
│   │   └── ui/                     # ProjectView, MessageCard, FragmentWeb, etc.
│   └── usage/
│       └── server/procedures.ts    # tRPC: credit status query
│
├── prisma/                         # Database schema & migrations
│   └── schema.prisma               # Project, Message, Fragment, Usage models
│
├── sandbox-templates/              # E2B sandbox configuration
│   └── nextjs/                     # Next.js + Shadcn template & Dockerfile
│
├── trpc/                           # tRPC infrastructure
│   ├── init.ts                     # tRPC context, router, procedures (auth middleware)
│   ├── routers/_app.ts             # Root router (messages, projects, usage)
│   ├── client.tsx                  # tRPC React client hooks
│   ├── query-client.ts             # TanStack Query client config
│   └── server.tsx                  # Server-side tRPC caller
│
├── prompt.ts                       # AI system prompts (Code Agent, Title, Response)
├── types.ts                        # Shared TreeItem type
├── middleware.ts                   # Clerk auth route protection
└── prisma.config.ts                # Prisma CLI configuration
```

---

## 🗄️ Database Schema

The app uses **PostgreSQL** via Prisma with four core models:

```prisma
model Project {
  id        String    @id @default(uuid())
  name      String             // Auto-generated 3-word slug
  userId    String             // Clerk User ID
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  messages  Message[]
}

model Message {
  id        String      @id @default(uuid())
  content   String
  role      MessageRole        // USER | ASSISTANT
  type      MessageType        // RESULT | ERROR
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  fragment  Fragment?          // Optional: attached code fragment
  projectId String
  project   Project     @relation(...)
}

model Fragment {
  id         String   @id @default(uuid())
  messageId  String   @unique
  message    Message  @relation(...)
  sandboxUrl String            // Live E2B sandbox URL (port 3000)
  title      String            // AI-generated title (e.g., "Landing Page")
  files      Json              // { "app/page.tsx": "...", ... }
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Usage {
  key    String    @id        // Clerk userId
  points Int                  // Remaining rate-limit points
  expire DateTime?
}
```

---

## 🤖 AI Agent Pipeline

The code generation is powered by a **multi-agent network** orchestrated via Inngest:

### 1. Trigger
When a user creates a project or sends a message, an `code-agent/run` event is dispatched to Inngest.

### 2. Sandbox Creation
An E2B cloud microVM is provisioned using a custom Next.js template (`shashwat132004/vibe-nextjs-shashwat-12`) with a 30-minute timeout. The sandbox runs a Next.js dev server with Turbopack and hot reload on port 3000.

### 3. Code Agent Execution
The primary **Code Agent** uses `gemini-2.5-flash` (temperature 0.1) with three tools:

| Tool | Description |
|---|---|
| `terminal` | Executes shell commands in the sandbox (e.g., `npm install` packages) |
| `createOrUpdateFiles` | Writes/updates files in the sandbox and tracks them in agent state |
| `readFiles` | Reads existing files from the sandbox filesystem |

The agent runs in a network loop (up to **15 iterations**) until it produces a `<task_summary>` tag signaling completion.

### 4. Post-Processing Agents
After the code agent finishes:
- **Fragment Title Generator** — Produces a ≤3-word descriptive title (e.g., "Admin Dashboard")
- **Response Generator** — Crafts a friendly 1-3 sentence summary for the user

### 5. Result Persistence
The sandbox URL, generated title, all files, and the response message are saved to the database as an `ASSISTANT` message with an attached `Fragment`.

---

## 💰 Usage & Rate Limiting

Credits are managed via `rate-limiter-flexible` backed by the Prisma `Usage` table:

| Tier | Credits | Window |
|---|---|---|
| **Free** | 5 generations | 30 days |
| **Pro** | 100 generations | 30 days |

Each project creation or message consumes **1 credit**. When credits are exhausted, the user is prompted to upgrade on the `/pricing` page (powered by Clerk's PricingTable component).

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) database (or a [Neon](https://neon.tech/) account)
- [Clerk](https://clerk.com/) account (with Google OAuth configured)
- [Google AI Studio](https://aistudio.google.com/) API key (for Gemini)
- [E2B](https://e2b.dev/) account & API key
- [Inngest](https://www.inngest.com/) account (or use the local dev server)

### 1. Clone the Repository

```bash
git clone https://github.com/Shashwat1306/Vibe.git
cd Vibe/vibe
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root with the following keys:

```env
# Database
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google Gemini
GEMINI_API_KEY="your-gemini-api-key"

# E2B Sandbox
E2B_API_KEY="your-e2b-api-key"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Inngest (set to 1 for local development)
INNGEST_DEV=1
```

### 4. Set Up the Database

```bash
# Generate Prisma Client
npm run db:generate

# Push the schema to your database
npm run db:push
```

### 5. Start the Development Server

You need two terminals running simultaneously:

**Terminal 1 — Next.js App:**
```bash
npm run dev
```

**Terminal 2 — Inngest Dev Server:**
```bash
npm run inngest:dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js dev server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:migrate` | Run database migrations |
| `npm run inngest:dev` | Start the Inngest local dev server |

---

## 🔑 tRPC API Routes

All API calls are type-safe via tRPC. Protected procedures require Clerk authentication.

### Projects Router (`projects`)
| Procedure | Type | Description |
|---|---|---|
| `projects.getOne` | Query | Get a single project by ID |
| `projects.getMany` | Query | List all projects for the authenticated user |
| `projects.create` | Mutation | Create a new project (consumes 1 credit, triggers AI agent) |

### Messages Router (`messages`)
| Procedure | Type | Description |
|---|---|---|
| `messages.getMany` | Query | Get all messages for a project (includes fragments) |
| `messages.create` | Mutation | Send a new message (consumes 1 credit, triggers AI agent) |

### Usage Router (`usage`)
| Procedure | Type | Description |
|---|---|---|
| `usage.status` | Query | Get current credit usage status for the authenticated user |

---

## 🎨 Project Templates

Vibe includes 8 curated starter templates to inspire users:

| Template | Description |
|---|---|
| 🎬 Netflix Clone | Hero banner, movie sections, responsive cards, detail modal |
| 📦 Admin Dashboard | Sidebar, stat cards, chart placeholder, filterable table |
| 📋 Kanban Board | Drag-and-drop columns with add/remove task support |
| 🗂️ File Manager | Folder list, file grid, rename/delete operations |
| 📺 YouTube Clone | Video thumbnails, category sidebar, preview modal |
| 🛍️ Store Page | Category filters, product grid, cart functionality |
| 🏡 Airbnb Clone | Listings grid, filter sidebar, property detail modal |
| 🎵 Spotify Clone | Playlist sidebar, song details, playback controls |

---

## 🧩 User Flow

```
1. Sign In         → Google OAuth via Clerk
                         │
2. Landing Page    → Type a prompt or select a template
                         │
3. Project Created → Auto-generated 3-word slug name
                         │
4. AI Generates    → Inngest triggers the code agent pipeline
                    → E2B sandbox is provisioned
                    → Gemini writes & executes code
                         │
5. Workspace       → Split-pane view:
                    → Left: Chat messages with AI responses
                    → Right: Live preview (Demo tab) + File explorer (Code tab)
                         │
6. Iterate         → Send follow-up messages to refine, add features, or fix bugs
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and not currently licensed for public distribution.

---

<p align="center">
  Built with ❤️ using Next.js, Google Gemini, E2B, Inngest, and Clerk
</p>
