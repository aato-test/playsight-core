# PlaySight Core v2.4

> **Collaborative Quality Workspace for End-to-End Regression Automation**  
> High-density IDE combining a visual node-based workflow builder, real Playwright execution engine, Playwright trace inspector, Jira bi-directional traceability, and QA diagnostics copilot.

---

## Architecture Overview

```
                      +---------------------------------------+
                      |       PlaySight Core UI (React 19)    |
                      |  - Visual Builder (SVG Bezier Graph)  |
                      |  - Playwright Trace Inspector         |
                      |  - Jira Traceability Matrix           |
                      |  - Diagnostics Copilot Drawer         |
                      +-------------------+-------------------+
                                          |
                      +-------------------+-------------------+
                      |      Vite 6 / Express 5 API Gateway   |
                      |    (Port 3000 Unified Port or Proxy)  |
                      +---------+-------------------+---------+
                                |                   |
             +------------------+                   +------------------+
             v                                                         v
+-----------------------------+                           +-----------------------------+
|    Playwright Test Runner   |                           |    Persistence Layer        |
| - Headless Browser Contexts |                           | - PostgreSQL (Drizzle ORM)  |
| - Har Network Capture       |                           | - Zero-config In-Memory     |
| - Trace (.zip) Packaging    |                           |   Store Fallback            |
| - Screenshot Snapshots      |                           | - Real File Artifacts       |
+-----------------------------+                           +-----------------------------+
```

---

## Key Features

1. **Visual Workflow Builder**
   - 290px engineering nodes for `navigate`, `click`, `input`, and `assert` steps.
   - SVG Bezier curve routing with directional flow pins.
   - Interactive input-to-output wiring, canvas pan/zoom, and one-click auto-layout.
   - Selector confidence scores, DOM test preview, and auto-healing proposals.

2. **Full-Stack Playwright Automation Engine**
   - Real Playwright runner (`server/executor/runner.ts`) mapping visual nodes directly into Chromium execution.
   - Execution timeline capturing console logs, HTTP network waterfalls, DOM snapshots, and traces.
   - Trace artifacts packaged into `.zip` and screenshots served via `/api/artifacts/:id`.

3. **Playwright Trace Inspector**
   - High-density diagnostics modal with visual step waterfall timeline.
   - Tabs for Actions, Console Logs, Network HAR table, Action Frame Screenshots, and DOM Snapshot inspection.
   - One-click trace `.zip` and `.json` export.

4. **Jira Bi-Directional Traceability**
   - Traceability Matrix and Kanban board views with bidirectional sync states (`synced`, `pending_sync`, `review`).
   - Conflict resolution modal with step-level and selector-level diffing.

5. **Resilient Dual Storage**
   - **PostgreSQL + Drizzle ORM**: Production mode with connection pooling and migrations.
   - **Zero-Config In-Memory Fallback**: When `DATABASE_URL` is not set, the app boots instantly with demo suites (`Playwright docs navigation`, `Example.com missing login button`) and seeded execution artifacts.

---

## Quick Start

### 1. Prerequisites
- **Node.js**: v20 or higher
- **Package Manager**: `npm` or `pnpm`

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server

#### Option A: Unified Full-Stack Mode (Recommended)
Runs Express 5 with Vite middleware on a single port (`http://localhost:3000`):
```bash
npm run dev
```

#### Option B: Standalone Frontend
Runs pure Vite dev server on `http://localhost:3000`:
```bash
npm run dev:client
```

#### Option C: Backend Server Only
Runs the Express API on port 3000:
```bash
npm run dev:server
```

### 4. Optional: Install Headless Playwright Browsers
To execute live Playwright tests against external websites:
```bash
npm run playwright:install
```

### 5. Type Checking & Production Build
```bash
# Typecheck client (tsconfig.json) and server (tsconfig.server.json)
npm run lint

# Build production client bundle into dist/
npm run build
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check reporting database mode (`postgres` or `in-memory`) |
| `GET` | `/api/suites` | List all saved test suites with latest execution status |
| `GET` | `/api/suites/:id` | Get single suite by ID |
| `POST` | `/api/suites` | Create a new test suite |
| `PUT` | `/api/suites/:id` | Update an existing test suite |
| `DELETE` | `/api/suites/:id` | Delete a test suite |
| `GET` | `/api/runs` | List test execution runs with step summaries |
| `POST` | `/api/runs` | Queue a new test run across specified browsers |
| `GET` | `/api/runs/:id` | Get detailed test run including step telemetry and artifacts |
| `GET` | `/api/runs/:id/evidence` | Grounded failure data (console errors, network failures, DOM snapshot) |
| `POST` | `/api/runs/:id/rerun` | Rerun an existing test sequence |
| `POST` | `/api/runs/:id/cancel` | Cancel an active or queued test run |
| `GET` | `/api/artifacts/:id` | Download or view captured screenshots (`.png`) and traces (`.zip`) |
| `GET` | `/api/metrics` | QA telemetry metrics (pass rate, daily trend, release gate status) |

---

## Design System Rules

- **Palette**: Technical dark aesthetic with `#020617` base background, `#0F172A` surface, `#1E293B` borders. Accent colors: teal (`#14B8A6`), cyan (`#06B6D4`), emerald (`#10B981`), amber (`#F59E0B`), rose (`#F43F5E`).
- **Zero-Pill**: No rounded capsule pills or card-in-card sandwiches; strict technical borders with 4px border radius.
- **Typography**: Plus Jakarta Sans for UI controls, JetBrains Mono for selectors, code snippets, timestamps, and tabular telemetry numerals.
