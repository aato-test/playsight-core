# PlaySight Core Project Handoff

## What This Project Is

PlaySight Core is a React + TypeScript prototype for a quality engineering workspace. It presents a dashboard, visual test-flow builder, Jira-style board, test history, team hub, settings, and a QA Copilot panel. The interface is interactive, but most data and integrations are demonstration-only; it is not currently connected to a test runner or external services.

This document maps the complete source tree and calls out what is real, what is simulated, what must be implemented for production, and how the current visual theme is configured. The complete source is also inlined in the appendix below; repository files remain canonical, so regenerate that snapshot after code changes.

## File Structure

```text
playsight-core/
|-- .env.example                 # Placeholder Gemini and app URL variables
|-- .gitignore
|-- index.html                   # HTML entry, metadata, Google Fonts
|-- metadata.json                # AI Studio/project metadata
|-- package.json                 # Scripts and dependencies
|-- package-lock.json
|-- README.md                    # AI Studio starter instructions
|-- tsconfig.json                # TypeScript compiler settings
|-- vite.config.ts               # Vite, React, Tailwind plugins and dev server
|-- public/
|   `-- assets/aistudio/         # AI Studio static asset directory
`-- src/
    |-- main.tsx                 # React DOM entry point
    |-- App.tsx                  # App shell, state, event handlers, screen selection
    |-- index.css                # Global reset, font defaults, scrollbar styling
    |-- types.ts                 # Shared TypeScript domain types
    |-- data/
    |   `-- mockData.ts          # Demo fixtures and JSON payload generation
    |-- utils/
    |   |-- useClickOutside.ts  # Outside-click dismissal hook
    |   `-- validate.ts          # Test-step validation
    `-- components/
        |-- DashboardCards.tsx   # Dashboard metrics, tasks, suites, recent runs
        |-- JiraBoard.tsx        # Local Jira-style Kanban board and issue modal
        |-- QACopilot.tsx        # Chat UI and scripted AI response simulation
        |-- SettingsView.tsx     # Locally persisted executor preferences
        |-- Sidebar.tsx          # Navigation, suite picker, branch selector
        |-- TeamHub.tsx          # Local chat and sample team/calendar data
        |-- TestRunHistory.tsx   # Search/filter, sample and local simulated reports
        |-- Topbar.tsx           # Page actions, browser selector, notifications, search
        |-- UserAvatar.tsx       # Initials avatars and per-user colors
        `-- VisualBuilder/
            |-- VisualBuilder.tsx     # Builder state and node/edge mutations
            |-- CanvasArea.tsx        # Pan/zoom, drag/drop, nodes and connections
            |-- PropertiesPanel.tsx   # Selected step editor and JSON view
            |-- ToolboxPanel.tsx      # Step palette and preset controls
            `-- JsonExportModal.tsx   # JSON export and illustrative Python runner
```

## Source Code Map

- `src/main.tsx` mounts `App` under React Strict Mode and loads `index.css`.
- `src/App.tsx` owns the active tab, selected suite, branches, issues, messages, run state, notifications, and top-level callbacks. It switches between screens and opens the Copilot and JSON dialogs.
- `src/types.ts` defines test steps/suites/runs, Jira issues, branches, team messages, history records, and Copilot messages.
- `src/data/mockData.ts` supplies the initial demo fixtures and `generateExecutorJson`, which serializes graph steps for display/download.
- `src/utils/validate.ts` validates step fields before the simulated run advances each node; `src/utils/useClickOutside.ts` dismisses dropdowns when clicked away from.
- `src/components/VisualBuilder/VisualBuilder.tsx` mutates suite nodes and edges and coordinates the builder panels.
- `src/components/VisualBuilder/CanvasArea.tsx` implements the canvas interactions and visual node graph.
- `src/components/VisualBuilder/PropertiesPanel.tsx` edits step title/data and copies a selected node as JSON.
- `src/components/VisualBuilder/ToolboxPanel.tsx` exposes step types and preset buttons.
- `src/components/VisualBuilder/JsonExportModal.tsx` creates a JSON download and displays/copies a sample Python script. It does not run Python.
- `src/components/DashboardCards.tsx` renders the overview and routes the user to suites, builder, and Jira board.
- `src/components/JiraBoard.tsx` filters, creates, links, and moves local issue objects.
- `src/components/TestRunHistory.tsx` renders locally defined history records and detail dialogs.
- `src/components/QACopilot.tsx` displays a chat and canned responses; selector healing updates local suite state.
- `src/components/TeamHub.tsx` contains local-only chat, sample team members, a generated current-month calendar, and disconnected integration statuses; it displays no secret values.
- `src/components/SettingsView.tsx` validates and persists executor preferences in this browser's local storage. This does not configure a running executor.
- `src/components/Sidebar.tsx` and `src/components/Topbar.tsx` provide navigation, suite/branch selection, browser controls, shortcuts, notifications, and builder actions.
- `src/components/UserAvatar.tsx` builds initials avatars from names.
- `src/index.css` sets global dimensions, background/text defaults, font stacks, and scrollbar colors. Most panel, border, glow, and glass styling currently lives in Tailwind class strings inside the components.
- `index.html` loads Plus Jakarta Sans and JetBrains Mono from Google Fonts and sets page/social metadata.
- `vite.config.ts`, `tsconfig.json`, and `package.json` define the development/build toolchain.
- `.env.example` documents placeholders only. It is not a backend configuration and contains no usable credentials.

## Functional Today

- Tab navigation, suite selection, branch selection, and browser selection work within the current browser session; branches remain local fixtures.
- The visual builder supports adding, selecting, editing, deleting, duplicating, dragging, connecting, panning, and zooming nodes. These edits live only in React memory.
- The builder's simulated runner follows graph order, validates fields, stops at the first invalid step, and records in-memory passed/failed results and history.
- The Jira-style screen can filter issues, create local issue records with unique keys, change statuses, and link an issue to a suite in local state.
- The Copilot drawer gives scripted replies to typed and quick-prompt messages; the seeded selector proposal can update a linked local issue and suite.
- JSON can be generated in the browser, copied, and downloaded with the selected browser. Masked values are represented by environment-variable names, not included as text.
- The app has a responsive layout in many component sections, but fixed-width panels and the canvas need real-device/browser checks before production.

## Simulated or Incomplete Features

| Feature | Current behavior | Production work required |
|---|---|---|
| Test execution | The UI simulates each step, validates URLs/selectors/expected values, and records failure or success in memory. It does not launch a browser or dispatch to Python. | Submit a validated run request to a server-side Playwright service; stream real step status; handle timeouts, cancellation, retries, failure artifacts, and actual results. |
| Run history | Initial rows and reports are sample fixtures; new simulated runs appear in the current app session. Fixture logs are labeled as demo output. | Persist run records and artifacts; query/filter them from an API and connect selected reports to real logs/screenshots/traces. |
| Jira | Issues, users, workflow status, and coverage are fixtures/local state. The UI is not connected to Atlassian. | OAuth/service integration, permission checks, paging, issue validation, conflict handling, and explicit synchronization rules. |
| Git branches and CI | Branch names, commit hashes, providers, health, and statuses are fixtures. Selecting a branch only changes local state and a toast. | Git provider authorization, branch/commit/PR APIs, webhook verification, and real CI dispatch/status callbacks. |
| QA Copilot | Initial messages and responses are scripted. No Gemini/API request is made; model credentials are not included as frontend dependencies. | Call an authenticated server endpoint; keep model keys server-side; provide grounded context, rate limits, audit logs, and confirmation/validation before applying suggestions. |
| Auto-heal | Applying the seeded proposal changes a selector in local state and moves matching linked issue `PS-1028` to Review. It does not inspect a DOM or verify the replacement. | Generate a proposal from real failure/DOM evidence, show a diff, require approval, validate it with a real rerun, then persist and audit it. |
| Team Hub | Messages are stored in component state; team members are sample data, the calendar has no events, and the UI says “Local only.” | Authenticated identities, database-backed messages, realtime transport, actual calendar data, presence, and authorization. |
| Settings and secrets | Executor preferences validate and persist in browser local storage. No API tokens or secret values are shown. These settings do not configure a running executor. | Persist settings securely server-side and enforce per-user permissions; use server-side secret storage and masked status-only responses. |
| Notifications/search | Topbar notifications show the latest local run records; global search returns local suite and issue matches. The data is not synchronized with external services. | Notification API/state and a real global search across the intended entities. |
| Dashboard telemetry | Pass rate, health, progress, in-progress tickets, and coverage are calculated from seeded/local run and issue data. | Replace with API-backed metrics, define metric semantics, timestamps, loading/error/empty states, and access rules. |
| Presets | Login, Checkout, and Search preset buttons map to their matching seeded suites. | Add persisted/user-defined presets and tests for unavailable presets. |
| Export contract | Graph ordering is shared with the runner and export; metadata reflects the selected browser. The sample Python script covers current click and assertion types, but is not a maintained or invoked executor. Masked values use environment variable references. | Version and validate a shared payload schema, implement every action/assertion in a real runner, and maintain contract tests. |
| Type/domain consistency | Jira status and assertion enums are aligned between fixtures, types, and editor options. | Validate imported/exported data at runtime and add type-level/runtime contract tests. |

## What To Redo For Production

Recommended order:

1. **Define contracts first.** Specify API endpoints and schemas for suites, graph edges, run requests/events/results, issues, branches, settings, Copilot requests, and reports. Validate both browser and server payloads.
2. **Add a backend and persistence.** Move suite, issue, message, settings, and run state out of component memory. Add authentication, tenant/workspace ownership, authorization, and migrations.
3. **Implement the real test executor.** A backend worker should launch Playwright, map every step/assertion type, enforce timeouts, return per-step results, and store screenshots/traces/logs. The UI should consume progress events rather than invent success.
4. **Replace each integration fixture.** Connect Jira and Git providers through a backend, use signed webhooks for CI updates, and make synchronization direction/conflict rules explicit.
5. **Replace the Copilot simulation.** Make model calls on the server, attach relevant run/DOM context, return structured proposals, and require permission/approval plus verification for mutations.
6. **Secure settings and secrets.** Remove token-like demo strings; never reveal a stored credential back to the browser. Add safe forms, server-side validation, and audit history.
7. **Finish the reliability layer.** Add loading, empty, error, retry, and offline states; test keyboard and screen-reader behavior; cover graph validation, browser compatibility, and mobile layouts.

## Current Visual Theme

`src/index.css` now remaps the existing Tailwind slate and teal tokens to layered indigo/navy surfaces and a lavender accent, so existing component classes inherit the new palette. It disables backdrop blur, teal/emerald/rose glow shadows, and ping animation, and adds a visible keyboard focus outline. The JSON modal and Jira board now use the shared slate surfaces.

Most card, button, and step styling still lives in component Tailwind class strings. Keep semantic status colors meaningful (green passed, red failed, amber warning/running), use monospace for identifiers/selectors/branches/JSON/logs rather than ordinary labels, and verify contrast, keyboard focus, reduced motion, and the builder's 1280px layout when changing the theme further.

## Run Locally

```bash
npm install
npm run dev
```

The Vite dev server is configured for port `3000`. Useful checks:

```bash
npm run lint
npm run build
```

`npm run lint` runs TypeScript with `tsc --noEmit`; it is not a separate ESLint configuration. No server-side executor or API service is included in this repository.

## Important Demo Safety Note

Do not use the token-like strings shown in Team Hub or SettingsView as real credentials. They are hard-coded display fixtures and must be removed before deployment. The `.env.example` values are placeholders; the frontend currently does not call Gemini or use `GEMINI_API_KEY`.

## Complete Source Appendix

The appendix below contains the current application source and runtime configuration. Repository files are canonical; regenerate this section after future code changes. `README.md` and `package-lock.json` are omitted because they are documentation and a generated dependency lockfile.

### `src/main.tsx`

```tsx
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

```

### `src/App.tsx`

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardCards } from './components/DashboardCards';
import { VisualBuilder } from './components/VisualBuilder/VisualBuilder';
import { JiraBoard } from './components/JiraBoard';
import { TeamHub } from './components/TeamHub';
import { TestRunHistory } from './components/TestRunHistory';
import { SettingsView } from './components/SettingsView';
import { QACopilot } from './components/QACopilot';
import { JsonExportModal } from './components/VisualBuilder/JsonExportModal';
import {
  MOCK_TEST_SUITES,
  MOCK_TEST_RUNS,
  MOCK_JIRA_ISSUES,
  MOCK_BRANCHES,
  INITIAL_COPILOT_MESSAGES,
  MOCK_TEST_HISTORY_RECORDS,
  orderNodes,
} from './data/mockData';
import { validateNode } from './utils/validate';
import {
  ActiveTab,
  TestSuite,
  TestRunResult,
  JiraIssue,
  BranchInfo,
  CopilotMessage,
  TestHistoryRecord,
  TestNode,
} from './types';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [suites, setSuites] = useState<TestSuite[]>(MOCK_TEST_SUITES);
  const [currentSuiteId, setCurrentSuiteId] = useState<string>(MOCK_TEST_SUITES[0].id);
  const [testRuns, setTestRuns] = useState<TestRunResult[]>(MOCK_TEST_RUNS);
  const [jiraIssues, setJiraIssues] = useState<JiraIssue[]>(MOCK_JIRA_ISSUES);
  const [branches, setBranches] = useState<BranchInfo[]>(MOCK_BRANCHES);
  const [currentBranch, setCurrentBranch] = useState<string>('feature/checkout-fix');
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>(INITIAL_COPILOT_MESSAGES);
  const [history, setHistory] = useState<TestHistoryRecord[]>(MOCK_TEST_HISTORY_RECORDS);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'info';
    message: string;
  } | null>(null);
  const suitesRef = useRef(suites);
  const runningRef = useRef(false);
  const baselines = useRef(
    Object.fromEntries(MOCK_TEST_SUITES.map((suite) => [suite.id, suite]))
  ).current;

  useEffect(() => {
    suitesRef.current = suites;
  }, [suites]);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const currentSuite =
    suites.find((s) => s.id === currentSuiteId) || suites[0] || MOCK_TEST_SUITES[0];
  const hasFailure = currentSuite.nodes.some((node) => node.status === 'failed' || node.errorMessage);

  // Global Keyboard shortcuts: ⌘J / Ctrl+J for Copilot, ⌘K for search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsCopilotOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search') as HTMLInputElement | null;
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Update active suite
  const handleUpdateCurrentSuite = (updatedSuite: TestSuite) => {
    setSuites((prev) =>
      prev.map((s) => (s.id === updatedSuite.id ? updatedSuite : s))
    );
  };

  // Browser target change
  const handleBrowserChange = (browser: 'chromium' | 'firefox' | 'webkit') => {
    handleUpdateCurrentSuite({
      ...currentSuite,
      targetBrowser: browser,
      updatedAt: 'Just now',
    });
    showNotification(`Target browser switched to ${browser}`);
  };

  // Reset current suite
  const handleResetSuite = () => {
    const baseline = baselines[currentSuite.id];
    if (!baseline) {
      showNotification('No saved baseline for this suite', 'info');
      return;
    }
    handleUpdateCurrentSuite({
      ...baseline,
      targetBrowser: currentSuite.targetBrowser,
      updatedAt: 'Just now',
    });
    showNotification('Suite reset to its saved baseline');
  };

  // Create new suite
  const handleCreateNewSuite = () => {
    const newId = `suite-${Date.now().toString().slice(-4)}`;
    const newSuite: TestSuite = {
      id: newId,
      name: `Custom Test Sequence #${suites.length + 1}`,
      description: 'Newly created visual flow for custom interaction and assertion testing.',
      targetBrowser: 'chromium',
      baseUrl: 'https://staging.app.example.com',
      nodes: [
        {
          id: `node-${Date.now().toString().slice(-4)}`,
          type: 'navigate',
          title: 'Navigate to App',
          position: { x: 80, y: 120 },
          data: {
            url: 'https://staging.app.example.com',
            timeout: 10000,
            waitUntil: 'networkidle',
          },
          status: 'idle',
        },
      ],
      edges: [],
      updatedAt: 'Just now',
    };

    setSuites((prev) => [newSuite, ...prev]);
    setCurrentSuiteId(newId);
    setActiveTab('builder');
    showNotification('Created new test suite sequence');
  };

  // Load Preset
  const handleLoadPreset = (presetName: string) => {
    const presets: Record<string, string> = {
      login: 'suite-auth-login',
      checkout: 'suite-cart-checkout',
      search: 'suite-search-filtering',
    };
    const target = suites.find((suite) => suite.id === presets[presetName]);
    if (!target) {
      showNotification(`Preset "${presetName}" is not available`, 'info');
      return;
    }
    setCurrentSuiteId(target.id);
    showNotification(`Loaded preset: "${target.name}"`);
  };

  // Open specific suite in Visual Builder
  const handleOpenSuiteInBuilder = (suiteId?: string) => {
    if (suiteId) {
      setCurrentSuiteId(suiteId);
    }
    setActiveTab('builder');
  };

  // Branch Selector handler
  const handleSelectBranch = (branchName: string) => {
    setCurrentBranch(branchName);
    const branchInfo = branches.find((b) => b.name === branchName);
    showNotification(
      `Switched to branch "${branchName}" (${branchInfo?.ciService}: ${branchInfo?.pipelineStatus})`
    );
  };

  // Jira issue updates
  const handleUpdateJiraIssue = (updatedIssue: JiraIssue) => {
    setJiraIssues((prev) => {
      const exists = prev.some((i) => i.id === updatedIssue.id);
      if (exists) {
        return prev.map((i) => (i.id === updatedIssue.id ? updatedIssue : i));
      }
      return [updatedIssue, ...prev];
    });
    showNotification(`Updated ticket ${updatedIssue.key}`);
  };

  // Link Visual Test Suite to Jira issue
  const handleLinkTestToIssue = (issueId: string, suiteId: string, suiteName: string) => {
    const latestRun = testRuns.find((run) => run.suiteId === suiteId);
    const testPassRate = latestRun && latestRun.totalSteps > 0
      ? Math.round((latestRun.passedSteps / latestRun.totalSteps) * 100)
      : undefined;
    setJiraIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              linkedSuiteId: suiteId,
              linkedSuiteName: suiteName,
              testPassRate,
              updatedAt: 'Just now',
            }
          : i
      )
    );
    showNotification(`Linked sequence "${suiteName}" to ticket`);
  };

  // Auto-heal node action called from QACopilot
  const handleHealNode = (nodeId: string, newSelector: string) => {
    // 1. Update node in currentSuite
    const updatedNodes = currentSuite.nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            selector: newSelector,
          },
          status: 'idle' as const,
          errorMessage: undefined,
        };
      }
      return node;
    });

    const updatedSuite = {
      ...currentSuite,
      nodes: updatedNodes,
      updatedAt: 'Just now',
    };

    handleUpdateCurrentSuite(updatedSuite);

    // 2. Add confirmation message to copilot chat
    const followUpMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `✅ **Auto-heal Successfully Applied!**\nTarget step \`${nodeId}\` selector was updated to \`${newSelector}\`. Error state cleared. The sequence is ready for automated execution on branch \`${currentBranch}\`.`,
    };

    setCopilotMessages((prev) => [...prev, followUpMsg]);

    // 3. Synchronize Jira issue PS-1028 (if present)
    setJiraIssues((prev) =>
      prev.map((issue) =>
        issue.key === 'PS-1028' && issue.linkedSuiteId === currentSuite.id
          ? {
              ...issue,
              status: 'review',
              updatedAt: 'Just now (Auto-healed)',
            }
          : issue
      )
    );

    showNotification(`Step ${nodeId} selector updated to "${newSelector}"`);
  };

  // Copilot message sending
  const handleSendCopilotMessage = (text: string, sender: 'user' | 'ai' = 'user') => {
    const newMsg: CopilotMessage = {
      id: `msg-${sender}-${Date.now()}`,
      sender,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    };
    setCopilotMessages((prev) => [...prev, newMsg]);
  };

  const patchNode = (suiteId: string, nodeId: string, patch: Partial<TestNode>) => {
    setSuites((prev) =>
      prev.map((suite) =>
        suite.id !== suiteId
          ? suite
          : {
              ...suite,
              nodes: suite.nodes.map((node) =>
                node.id === nodeId ? { ...node, ...patch } : node
              ),
            }
      )
    );
  };

  const handleRunTest = async (suiteId: string = currentSuiteId) => {
    if (runningRef.current) return;
    const suite = suitesRef.current.find((item) => item.id === suiteId);
    if (!suite || suite.nodes.length === 0) {
      showNotification('Add at least one step before running', 'info');
      return;
    }

    runningRef.current = true;
    setIsRunning(true);
    const ordered = orderNodes(suite.nodes, suite.edges);
    setSuites((prev) =>
      prev.map((item) =>
        item.id === suiteId
          ? { ...item, nodes: item.nodes.map((node) => ({ ...node, status: 'idle' as const })) }
          : item
      )
    );
    showNotification(`Running "${suite.name}" on ${suite.targetBrowser} (simulated)...`, 'info');

    const started = Date.now();
    let passed = 0;
    let failure: string | undefined;
    const logs: string[] = [];

    try {
      for (const node of ordered) {
        patchNode(suiteId, node.id, { status: 'running' });
        await sleep(450);

        const liveNode =
          suitesRef.current.find((item) => item.id === suiteId)?.nodes.find((item) => item.id === node.id) ?? node;
        const error = validateNode(liveNode);
        if (error) {
          patchNode(suiteId, node.id, { status: 'failed', errorMessage: error });
          failure = `${node.title}: ${error}`;
          logs.push(`[ERROR] ${failure}`);
          break;
        }

        patchNode(suiteId, node.id, { status: 'success' });
        logs.push(`[OK] ${node.title}`);
        passed++;
      }
    } catch (error) {
      failure = error instanceof Error ? error.message : 'Unexpected run simulation error';
      logs.push(`[ERROR] ${failure}`);
    } finally {
      runningRef.current = false;
      setIsRunning(false);
    }

    const durationMs = Date.now() - started;
    const status: 'passed' | 'failed' = failure ? 'failed' : 'passed';
    const browserName = suite.targetBrowser[0].toUpperCase() + suite.targetBrowser.slice(1);
    const id = Date.now().toString().slice(-4);
    const newRun: TestRunResult = {
      id: `run-${id}`,
      suiteId,
      suiteName: suite.name,
      status,
      durationMs,
      totalSteps: ordered.length,
      passedSteps: passed,
      timestamp: 'Just now',
      browser: `${browserName} (simulated)`,
      triggeredBy: `PlaySight UI (${currentBranch})`,
    };
    setTestRuns((prev) => [newRun, ...prev]);
    setHistory((prev) => [
      {
        id: `hist-${id}`,
        status,
        testName: suite.name,
        trigger: `PlaySight UI · ${currentBranch}`,
        durationM: durationMs / 60000,
        reportId: `rep-ui-${id}`,
        timestamp: 'Just now',
        stepsCount: ordered.length,
        errorMessage: failure,
        consoleLogs: logs,
      },
      ...prev,
    ]);
    showNotification(
      failure ? `Run failed: ${failure}` : `All ${passed} steps passed`,
      failure ? 'info' : 'success'
    );
  };

  return (
    <div
      id="app-root"
      className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased"
    >
      {/* 1. Sidebar with Branch Selector & Jira Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        suites={suites}
        currentSuiteId={currentSuiteId}
        onSelectSuite={setCurrentSuiteId}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        branches={branches}
        currentBranch={currentBranch}
        onSelectBranch={handleSelectBranch}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 2. Topbar with Branch Selector, CI Status, and QA Copilot toggle */}
        <Topbar
          activeTab={activeTab}
          currentSuite={currentSuite}
          suites={suites}
          issues={jiraIssues}
          testRuns={testRuns}
          isRunning={isRunning}
          onRunTest={() => handleRunTest()}
          onOpenJsonModal={() => setIsJsonModalOpen(true)}
          onResetSuite={handleResetSuite}
          onBrowserChange={handleBrowserChange}
          branches={branches}
          currentBranch={currentBranch}
          onSelectBranch={handleSelectBranch}
          onOpenSuite={handleOpenSuiteInBuilder}
          onOpenJira={() => setActiveTab('jira')}
          isCopilotOpen={isCopilotOpen}
          onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
          hasHealAlert={hasFailure}
        />

        {/* Global Toast Notification */}
        {notification && (
          <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border shadow-xl text-xs backdrop-blur-md ${
                notification.type === 'success'
                  ? 'bg-slate-900/95 border-teal-500/40 text-teal-300'
                  : 'bg-slate-900/95 border-amber-500/40 text-amber-300'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* 3. Routing: Dashboard vs Visual Builder vs Jira Kanban vs Team vs History vs Settings */}
        <main className="flex-1 overflow-hidden bg-slate-950 flex flex-col relative">
          {activeTab === 'dashboard' ? (
            <div className="flex-1 overflow-y-auto">
              <DashboardCards
                suites={suites}
                testRuns={testRuns}
                jiraIssues={jiraIssues}
                currentBranch={currentBranch}
                branches={branches}
                onOpenSuiteInBuilder={handleOpenSuiteInBuilder}
                onCreateNewSuite={handleCreateNewSuite}
                onNavigateToBuilder={() => setActiveTab('builder')}
                onNavigateToJira={() => setActiveTab('jira')}
                onOpenJsonModal={() => setIsJsonModalOpen(true)}
                onTriggerQuickRun={(suiteId) => {
                  setCurrentSuiteId(suiteId);
                  setActiveTab('builder');
                  handleRunTest(suiteId);
                }}
              />
            </div>
          ) : activeTab === 'jira' ? (
            <JiraBoard
              issues={jiraIssues}
              suites={suites}
              onUpdateIssue={handleUpdateJiraIssue}
              onLinkTestToIssue={handleLinkTestToIssue}
              onNavigateToBuilder={handleOpenSuiteInBuilder}
              currentBranch={currentBranch}
            />
          ) : activeTab === 'history' ? (
            <TestRunHistory
              records={history}
              currentBranch={currentBranch}
              onRunTestAgain={() => {
                setActiveTab('builder');
                setTimeout(() => handleRunTest(), 300);
              }}
            />
          ) : activeTab === 'team' ? (
            <TeamHub currentBranch={currentBranch} />
          ) : activeTab === 'settings' ? (
            <SettingsView currentBranch={currentBranch} />
          ) : (
            <VisualBuilder
              key={currentSuite.id}
              suite={currentSuite}
              onUpdateSuite={handleUpdateCurrentSuite}
              onLoadPreset={handleLoadPreset}
              isRunning={isRunning}
              isCopilotOpen={isCopilotOpen}
              onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
              copilotMessages={copilotMessages}
              onSendCopilotMessage={handleSendCopilotMessage}
              onHealNode={handleHealNode}
              currentBranch={currentBranch}
            />
          )}

          {/* Global Copilot Drawer when outside of Visual Builder */}
          {activeTab !== 'builder' && isCopilotOpen && (
            <div className="fixed inset-y-0 right-0 z-50 flex">
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
                onClick={() => setIsCopilotOpen(false)}
              />
              <div className="relative z-10 h-full">
                <QACopilot
                  isOpen={isCopilotOpen}
                  onClose={() => setIsCopilotOpen(false)}
                  messages={copilotMessages}
                  onSendMessage={handleSendCopilotMessage}
                  onHealNode={handleHealNode}
                  currentSuite={currentSuite}
                  currentBranch={currentBranch}
                />
              </div>
            </div>
          )}

          {/* Floating FAB: Circular Teal 'Chatbot' button anchored to bottom-right of main content */}
          {!isCopilotOpen && <motion.button
            id="floating-chatbot-btn"
            aria-label="Chatbot"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsCopilotOpen((prev) => !prev)}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 shadow-xl shadow-teal-500/30 flex items-center justify-center transition-colors cursor-pointer border border-teal-300/50 group"
            title="Chatbot (⌘J)"
          >
            <span className="relative flex items-center justify-center">
              <Sparkles className="w-5 h-5 fill-slate-950 transition-transform group-hover:rotate-12 duration-200" />
              {hasFailure && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 border border-slate-950"></span>
                </span>
              )}
            </span>
            <span className="sr-only">Chatbot</span>
          </motion.button>}
        </main>
      </div>

      {/* JSON Payload Inspector & Exporter for Python test_executor.py */}
      <JsonExportModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        nodes={currentSuite.nodes}
        edges={currentSuite.edges}
        suiteName={currentSuite.name}
        browser={currentSuite.targetBrowser}
      />
    </div>
  );
}

```

### `src/types.ts`

```typescript
export type StepType = 'navigate' | 'click' | 'input' | 'assert';

export interface NavigateStepData {
  url: string;
  timeout: number;
  waitUntil: 'load' | 'domcontentloaded' | 'networkidle';
}

export interface ClickStepData {
  selector: string;
  clickType: 'single' | 'double' | 'right';
  waitForSelector: boolean;
  timeout: number;
}

export interface InputStepData {
  selector: string;
  value: string;
  clearFirst: boolean;
  maskInput: boolean;
  timeout: number;
}

export interface AssertStepData {
  selector: string;
  assertionType: 'is_visible' | 'text_contains' | 'text_equals' | 'has_value' | 'url_contains';
  expectedValue: string;
  failureMessage: string;
  timeout: number;
}

export type StepData = NavigateStepData | ClickStepData | InputStepData | AssertStepData;

export interface TestNode {
  id: string;
  type: StepType;
  title: string;
  description?: string;
  position: { x: number; y: number };
  data: StepData;
  status?: 'idle' | 'running' | 'success' | 'failed';
  errorMessage?: string;
}

export interface ConnectionEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  targetBrowser: 'chromium' | 'firefox' | 'webkit';
  baseUrl: string;
  nodes: TestNode[];
  edges: ConnectionEdge[];
  updatedAt: string;
}

export interface TestRunResult {
  id: string;
  suiteId: string;
  suiteName: string;
  status: 'passed' | 'failed' | 'running';
  durationMs: number;
  totalSteps: number;
  passedSteps: number;
  timestamp: string;
  browser: string;
  triggeredBy: string;
}

export type ActiveTab = 'dashboard' | 'builder' | 'history' | 'team' | 'settings' | 'jira';

export interface TeamMessage {
  id: string;
  sender: string;
  handle: string;
  avatar: string;
  time: string;
  content: string;
}

export interface TestHistoryRecord {
  id: string;
  status: 'passed' | 'failed';
  testName: string;
  trigger: string;
  durationM: number;
  reportId: string;
  timestamp: string;
  stepsCount: number;
  errorMessage?: string;
  consoleLogs?: string[];
}

export type JiraPriority = 'highest' | 'high' | 'medium' | 'low';
export type JiraStatus = 'todo' | 'inprogress' | 'review' | 'done';
export type JiraIssueType = 'story' | 'bug' | 'task';

export interface JiraIssue {
  id: string;
  key: string;
  title: string;
  status: JiraStatus;
  priority: JiraPriority;
  type: JiraIssueType;
  storyPoints: number;
  assignee: {
    name: string;
    avatar: string;
    role: string;
  };
  labels: string[];
  description: string;
  linkedSuiteId?: string;
  linkedSuiteName?: string;
  testPassRate?: number;
  updatedAt: string;
}

export type PipelineStatus = 'passed' | 'deploying' | 'failed' | 'queued';

export interface BranchInfo {
  name: string;
  commit: string;
  author: string;
  pipelineStatus: PipelineStatus;
  ciService: 'Vercel Preview' | 'GitHub Actions';
  previewUrl?: string;
  lastUpdated: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'ai' | 'user';
  timestamp: string;
  text: string;
  healProposal?: {
    targetNodeId: string;
    oldSelector: string;
    newSelector: string;
    confidence: number;
    applied?: boolean;
    explanation?: string;
  };
  suggestedActions?: Array<{
    id: string;
    label: string;
    actionType: 'heal_node' | 'add_assertion' | 'fix_timeout' | 'generate_happy_path';
    payload?: any;
  }>;
}

```

### `src/index.css`

```css
@import "tailwindcss";

@theme {
  --color-slate-950: #0b0f1f;
  --color-slate-900: #131937;
  --color-slate-800: #1f2750;
  --color-slate-700: #323b6b;
  --color-slate-600: #4d5787;
  --color-slate-500: #7380b0;
  --color-slate-400: #a0abd4;
  --color-slate-300: #c6cdea;
  --color-slate-200: #dfe3f5;
  --color-slate-100: #f0f2fc;

  --color-teal-300: #c7cffe;
  --color-teal-400: #a3aefc;
  --color-teal-500: #8b9cf8;
  --color-teal-950: #1e2150;

  --color-emerald-400: #34d399;
  --color-amber-400: #fbbf24;
  --color-rose-400: #fb7185;
}

@layer base {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    max-width: none !important;
    overflow: hidden;
    background-color: var(--color-slate-950);
    color: var(--color-slate-100);
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    letter-spacing: -0.011em;
  }

  code, pre, kbd, samp, .font-mono {
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  }
}

/* Reduce the neon treatment while retaining the color palette. */
[class*="backdrop-blur"] {
  backdrop-filter: none !important;
}

[class*="shadow-teal"],
[class*="shadow-emerald"],
[class*="shadow-rose"] {
  box-shadow: none !important;
}

.animate-ping {
  animation: none !important;
}

:focus-visible {
  outline: 2px solid var(--color-teal-400);
  outline-offset: 2px;
}

/* Custom subtle scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

```

### `src/data/mockData.ts`

```typescript
import {
  TestSuite,
  TestRunResult,
  TestNode,
  ConnectionEdge,
  JiraIssue,
  BranchInfo,
  CopilotMessage,
  TeamMessage,
  TestHistoryRecord,
} from '../types';

export const INITIAL_TEST_NODES: TestNode[] = [
  {
    id: 'node-1',
    type: 'navigate',
    title: 'Navigate to Portal',
    description: 'Open login page with clean session',
    position: { x: 80, y: 120 },
    data: {
      url: 'https://staging.app.example.com/login',
      timeout: 10000,
      waitUntil: 'networkidle',
    },
    status: 'idle',
  },
  {
    id: 'node-2',
    type: 'input',
    title: 'Input Username',
    description: 'Enter test engineer credentials',
    position: { x: 380, y: 120 },
    data: {
      selector: 'input#auth-email',
      value: 'qa.lead@example.com',
      clearFirst: true,
      maskInput: false,
      timeout: 5000,
    },
    status: 'idle',
  },
  {
    id: 'node-3',
    type: 'input',
    title: 'Input Password',
    description: 'Fill secure password field',
    position: { x: 680, y: 120 },
    data: {
      selector: 'input#auth-password',
      value: 'Secur3Pass!99',
      clearFirst: true,
      maskInput: true,
      timeout: 5000,
    },
    status: 'idle',
  },
  {
    id: 'node-4',
    type: 'click',
    title: 'Click Sign In',
    description: 'Trigger submission button',
    position: { x: 980, y: 120 },
    data: {
      selector: '.login-btn',
      clickType: 'single',
      waitForSelector: true,
      timeout: 8000,
    },
    status: 'failed',
    errorMessage: 'Element .login-btn not found within 8000ms (DOM mismatch)',
  },
  {
    id: 'node-5',
    type: 'assert',
    title: 'Assert Dashboard Header',
    description: 'Verify successful redirection & welcome message',
    position: { x: 1280, y: 120 },
    data: {
      selector: 'h1.dashboard-heading',
      assertionType: 'text_contains',
      expectedValue: 'Welcome back, QA Lead',
      failureMessage: 'Expected dashboard welcome header was not visible after login',
      timeout: 10000,
    },
    status: 'idle',
  },
];

export const INITIAL_EDGES: ConnectionEdge[] = [
  { id: 'edge-1-2', sourceId: 'node-1', targetId: 'node-2' },
  { id: 'edge-2-3', sourceId: 'node-2', targetId: 'node-3' },
  { id: 'edge-3-4', sourceId: 'node-3', targetId: 'node-4' },
  { id: 'edge-4-5', sourceId: 'node-4', targetId: 'node-5' },
];

export const MOCK_TEST_SUITES: TestSuite[] = [
  {
    id: 'suite-auth-login',
    name: 'Authentication E2E Flow',
    description: 'Validates credential submission, session cookie creation, and dashboard arrival.',
    targetBrowser: 'chromium',
    baseUrl: 'https://staging.app.example.com',
    nodes: INITIAL_TEST_NODES,
    edges: INITIAL_EDGES,
    updatedAt: '12 mins ago',
  },
  {
    id: 'suite-cart-checkout',
    name: 'Checkout & Payment Gateway',
    description: 'Simulates item selection, cart drawer opening, coupon apply, and checkout assertion.',
    targetBrowser: 'chromium',
    baseUrl: 'https://store.example.com',
    nodes: [
      {
        id: 'c-1',
        type: 'navigate',
        title: 'Open Product Catalog',
        position: { x: 80, y: 100 },
        data: { url: 'https://store.example.com/catalog', timeout: 8000, waitUntil: 'domcontentloaded' },
      },
      {
        id: 'c-2',
        type: 'click',
        title: 'Add First Item',
        position: { x: 380, y: 100 },
        data: { selector: '.product-card:first-child button.add-to-cart', clickType: 'single', waitForSelector: true, timeout: 5000 },
      },
      {
        id: 'c-3',
        type: 'assert',
        title: 'Verify Cart Badge',
        position: { x: 680, y: 100 },
        data: { selector: '#cart-count-badge', assertionType: 'text_equals', expectedValue: '1', failureMessage: 'Badge count did not increment to 1', timeout: 5000 },
      },
    ],
    edges: [
      { id: 'ec-1-2', sourceId: 'c-1', targetId: 'c-2' },
      { id: 'ec-2-3', sourceId: 'c-2', targetId: 'c-3' },
    ],
    updatedAt: '2 hours ago',
  },
  {
    id: 'suite-search-filtering',
    name: 'Search & Facet Filter Test',
    description: 'Ensures instantaneous debounced query matching and facet category count assertions.',
    targetBrowser: 'firefox',
    baseUrl: 'https://search.example.com',
    nodes: [
      {
        id: 's-1',
        type: 'navigate',
        title: 'Navigate to Search',
        position: { x: 80, y: 100 },
        data: { url: 'https://search.example.com', timeout: 5000, waitUntil: 'load' },
      },
      {
        id: 's-2',
        type: 'input',
        title: 'Type Query: Kubernetes',
        position: { x: 380, y: 100 },
        data: { selector: 'input[name="q"]', value: 'Kubernetes deployment', clearFirst: true, maskInput: false, timeout: 5000 },
      },
      {
        id: 's-3',
        type: 'click',
        title: 'Click Search',
        position: { x: 680, y: 100 },
        data: { selector: 'button[type="submit"]', clickType: 'single', waitForSelector: true, timeout: 5000 },
      },
      {
        id: 's-4',
        type: 'assert',
        title: 'Assert Result Count',
        position: { x: 980, y: 100 },
        data: { selector: '.result-stat-counter', assertionType: 'is_visible', expectedValue: '', failureMessage: 'No results counter shown', timeout: 5000 },
      },
    ],
    edges: [
      { id: 'es-1-2', sourceId: 's-1', targetId: 's-2' },
      { id: 'es-2-3', sourceId: 's-2', targetId: 's-3' },
      { id: 'es-3-4', sourceId: 's-3', targetId: 's-4' },
    ],
    updatedAt: 'Yesterday',
  },
];

export const MOCK_TEST_RUNS: TestRunResult[] = [
  {
    id: 'run-9021',
    suiteId: 'suite-auth-login',
    suiteName: 'Authentication E2E Flow',
    status: 'passed',
    durationMs: 1840,
    totalSteps: 5,
    passedSteps: 5,
    timestamp: '14 minutes ago',
    browser: 'Chromium 124',
    triggeredBy: 'CI/CD Pipeline #418',
  },
  {
    id: 'run-9020',
    suiteId: 'suite-cart-checkout',
    suiteName: 'Checkout & Payment Gateway',
    status: 'passed',
    durationMs: 2410,
    totalSteps: 3,
    passedSteps: 3,
    timestamp: '42 minutes ago',
    browser: 'Chromium 124',
    triggeredBy: 'Manual (test_executor.py)',
  },
  {
    id: 'run-9019',
    suiteId: 'suite-search-filtering',
    suiteName: 'Search & Facet Filter Test',
    status: 'failed',
    durationMs: 3120,
    totalSteps: 4,
    passedSteps: 3,
    timestamp: '1 hour ago',
    browser: 'Firefox 125',
    triggeredBy: 'Nightly Regression',
  },
  {
    id: 'run-9018',
    suiteId: 'suite-auth-login',
    suiteName: 'Authentication E2E Flow',
    status: 'passed',
    durationMs: 1910,
    totalSteps: 5,
    passedSteps: 5,
    timestamp: '3 hours ago',
    browser: 'Chromium 124',
    triggeredBy: 'Git Hook (pre-push)',
  },
];

export function orderNodes(nodes: TestNode[], edges: ConnectionEdge[]): TestNode[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, number>();

  nodes.forEach(n => {
    outgoing.set(n.id, []);
    incoming.set(n.id, 0);
  });

  edges.forEach(e => {
    outgoing.get(e.sourceId)?.push(e.targetId);
    incoming.set(e.targetId, (incoming.get(e.targetId) || 0) + 1);
  });

  const roots = nodes
    .filter(n => (incoming.get(n.id) || 0) === 0)
    .sort((a, b) => a.position.x - b.position.x);
  const ordered: TestNode[] = [];
  const visited = new Set<string>();

  const traverse = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);
    const node = nodeMap.get(id);
    if (node) ordered.push(node);
    const children = (outgoing.get(id) || []).sort(
      (a, b) => (nodeMap.get(a)?.position.x || 0) - (nodeMap.get(b)?.position.x || 0)
    );
    children.forEach(traverse);
  };

  roots.forEach((root) => traverse(root.id));
  nodes
    .filter((node) => !visited.has(node.id))
    .sort((a, b) => a.position.x - b.position.x)
    .forEach((node) => ordered.push(node));

  return ordered;
}

export function generateExecutorJson(
  nodes: TestNode[],
  edges: ConnectionEdge[],
  suiteName = 'Test Suite',
  browser: 'chromium' | 'firefox' | 'webkit' = 'chromium'
) {
  const orderedNodes = orderNodes(nodes, edges);

  const steps = orderedNodes.map((node, index) => {
    let action = node.type;
    let parameters: Record<string, any> = {};

    if (node.type === 'navigate') {
      const d = node.data as any;
      parameters = {
        url: d.url || 'https://example.com',
        wait_until: d.waitUntil || 'networkidle',
        timeout_ms: d.timeout || 5000,
      };
    } else if (node.type === 'click') {
      const d = node.data as any;
      parameters = {
        selector: d.selector || 'button',
        click_type: d.clickType || 'single',
        wait_for_selector: d.waitForSelector ?? true,
        timeout_ms: d.timeout || 5000,
      };
    } else if (node.type === 'input') {
      const d = node.data as any;
      parameters = {
        selector: d.selector || 'input',
        text: d.maskInput ? '' : d.value || '',
        clear_first: d.clearFirst ?? true,
        mask_input: d.maskInput ?? false,
        ...(d.maskInput ? { secret_env: `PLAYWRIGHT_SECRET_${node.id.replace(/[^a-z0-9]/gi, '_').toUpperCase()}` } : {}),
        timeout_ms: d.timeout || 5000,
      };
    } else if (node.type === 'assert') {
      const d = node.data as any;
      parameters = {
        selector: d.selector || 'body',
        assertion_type: d.assertionType || 'is_visible',
        expected_value: d.expectedValue || '',
        failure_message: d.failureMessage || 'Assertion failed',
        timeout_ms: d.timeout || 5000,
      };
    }

    return {
      step_number: index + 1,
      step_id: node.id,
      title: node.title,
      action,
      parameters,
    };
  });

  return {
    schema_version: '1.2.0',
    target_executor: 'python_test_executor.py',
    generated_at: new Date().toISOString(),
    suite_metadata: {
      name: suiteName,
      browser,
      headless: true,
      slow_mo_ms: 150,
      viewport: { width: 1280, height: 800 },
      take_screenshot_on_failure: true,
    },
    steps,
  };
}

export const MOCK_BRANCHES: BranchInfo[] = [
  {
    name: 'main',
    commit: 'b4e9f2a',
    author: 'alex.dev@playsight.io',
    pipelineStatus: 'passed',
    ciService: 'GitHub Actions',
    lastUpdated: '12m ago',
  },
  {
    name: 'feature/checkout-fix',
    commit: 'f9301da',
    author: 'sara.qa@playsight.io',
    pipelineStatus: 'deploying',
    ciService: 'Vercel Preview',
    previewUrl: 'https://checkout-fix-preview.playsight.dev',
    lastUpdated: '2m ago',
  },
  {
    name: 'fix/login-oauth-race',
    commit: '8c22ab0',
    author: 'chen.platform@playsight.io',
    pipelineStatus: 'passed',
    ciService: 'Vercel Preview',
    previewUrl: 'https://oauth-fix-preview.playsight.dev',
    lastUpdated: '45m ago',
  },
  {
    name: 'chore/upgrade-playwright',
    commit: '1a980dd',
    author: 'alex.dev@playsight.io',
    pipelineStatus: 'queued',
    ciService: 'GitHub Actions',
    lastUpdated: '1h ago',
  },
];

export const MOCK_JIRA_ISSUES: JiraIssue[] = [
  {
    id: 'PS-1024',
    key: 'PS-1024',
    title: 'Migrate checkout sequence to Stripe Payment Element v3',
    status: 'inprogress',
    priority: 'highest',
    type: 'story',
    storyPoints: 5,
    assignee: {
      name: 'Alex Mercer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      role: 'Fullstack QA Lead',
    },
    labels: ['Checkout', 'Payments', 'E2E-Blocking'],
    description:
      'Refactor checkout flow validation to support asynchronous SCA 3D-Secure modal authentication and dynamic payment intent assertions.',
    linkedSuiteId: 'suite-cart-checkout',
    linkedSuiteName: 'Checkout & Payment Gateway',
    testPassRate: 100,
    updatedAt: '25m ago',
  },
  {
    id: 'PS-1025',
    key: 'PS-1025',
    title: 'Fix mobile navbar click intercept on small viewport iOS 17',
    status: 'todo',
    priority: 'high',
    type: 'bug',
    storyPoints: 3,
    assignee: {
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      role: 'Frontend Engineer',
    },
    labels: ['Mobile', 'Navigation', 'CSS-ZIndex'],
    description:
      'Navigation hamburger menu elements are not receiving touch events on iOS 17 webkit when header glassmorphism is engaged.',
    updatedAt: '1h ago',
  },
  {
    id: 'PS-1026',
    key: 'PS-1026',
    title: 'Implement SSO SAML & Okta callback assertion sequence',
    status: 'review',
    priority: 'medium',
    type: 'story',
    storyPoints: 8,
    assignee: {
      name: 'Marcus Brody',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      role: 'Security Engineer',
    },
    labels: ['Auth', 'SAML', 'Enterprise'],
    description:
      'Ensure test pipeline verifies identity provider state nonce, certificate rotation, and token refresh redirect URLs.',
    linkedSuiteId: 'suite-auth-login',
    linkedSuiteName: 'Authentication E2E Flow',
    testPassRate: 80,
    updatedAt: '3h ago',
  },
  {
    id: 'PS-1027',
    key: 'PS-1027',
    title: 'Optimize search debouncing & instant faceted filter results',
    status: 'done',
    priority: 'medium',
    type: 'task',
    storyPoints: 2,
    assignee: {
      name: 'Devon Vance',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      role: 'QA Engineer',
    },
    labels: ['Search', 'Performance'],
    description:
      'Verified zero lag on 150ms keystroke debounce, facet count badge accurately matches backend elasticsearch aggregations.',
    linkedSuiteId: 'suite-search-filtering',
    linkedSuiteName: 'Search & Facet Filter Test',
    testPassRate: 100,
    updatedAt: 'Yesterday',
  },
  {
    id: 'PS-1028',
    key: 'PS-1028',
    title: 'Update Sign-in button CSS selector from legacy class to ID',
    status: 'inprogress',
    priority: 'high',
    type: 'bug',
    storyPoints: 1,
    assignee: {
      name: 'Sara Lin',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      role: 'SDET',
    },
    labels: ['Auth', 'Flaky-Test', 'Auto-Heal'],
    description:
      'The `.login-btn` CSS class was removed in redesign PR #482. Test step node-4 requires updating to `#login-submit`.',
    linkedSuiteId: 'suite-auth-login',
    linkedSuiteName: 'Authentication E2E Flow',
    testPassRate: 60,
    updatedAt: '10m ago',
  },
  {
    id: 'PS-1029',
    key: 'PS-1029',
    title: 'Add automated visual regression snapshots for Cart Drawer',
    status: 'todo',
    priority: 'low',
    type: 'story',
    storyPoints: 3,
    assignee: {
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      role: 'Frontend Engineer',
    },
    labels: ['Visual-Regression', 'Cart'],
    description:
      'Capture and compare pixel diff snapshots on cart drawer item addition across Chromium, Firefox, and WebKit.',
    updatedAt: '2 days ago',
  },
];

export const INITIAL_COPILOT_MESSAGES: CopilotMessage[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    timestamp: '10:14 AM',
    text: 'Hello! I am your PlaySight QA Copilot. I continuously monitor test runs, inspect DOM mutations across branches, and suggest self-healing actions.',
  },
  {
    id: 'msg-2',
    sender: 'ai',
    timestamp: '10:15 AM',
    text: 'I noticed the `.login-btn` selector failed in step node-4 during the latest Chromium run. I found the new selector `#login-submit` from DOM diff. Click here to auto-heal the test node.',
    healProposal: {
      targetNodeId: 'node-4',
      oldSelector: '.login-btn',
      newSelector: '#login-submit',
      confidence: 98.4,
      explanation: 'Replaced deprecated Tailwind class with production id attribute "#login-submit"',
    },
    suggestedActions: [
      {
        id: 'act-1',
        label: 'Auto-heal Node #4',
        actionType: 'heal_node',
        payload: { nodeId: 'node-4', newSelector: '#login-submit' },
      },
    ],
  },
];

export const MOCK_TEAM_MESSAGES: TeamMessage[] = [
  {
    id: 'tm-1',
    sender: 'Daniel Jones',
    handle: 'daniel.j',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    time: '10:24 AM',
    content: 'Hey #1 team, SCRUM-6 is ready for review!',
  },
  {
    id: 'tm-2',
    sender: 'Sarah Jenkins',
    handle: 'ssrah.j',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    time: '10:29 AM',
    content: 'Hey #1 team, SCRUM-6 is looking good to merge!',
  },
  {
    id: 'tm-3',
    sender: 'Mike Thomas',
    handle: 'mike.t',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    time: '10:35 AM',
    content: 'Great work team...SOLID job!',
  },
];

export const MOCK_TEST_HISTORY_RECORDS: TestHistoryRecord[] = [
  {
    id: 'hist-1',
    status: 'passed',
    testName: 'GitHub Webhook Trigger',
    trigger: 'GitHub PR #114',
    durationM: 3.83,
    reportId: 'rep-114-1',
    timestamp: '5 mins ago',
    stepsCount: 8,
    consoleLogs: ['[OK] Webhook payload signature validated', '[OK] CI dispatch event fired', '[OK] Response 200 OK (3.83m)'],
  },
  {
    id: 'hist-2',
    status: 'passed',
    testName: 'GitHub Webhook Trigger',
    trigger: 'GitHub PR #114',
    durationM: 3.83,
    reportId: 'rep-114-2',
    timestamp: '18 mins ago',
    stepsCount: 8,
    consoleLogs: ['[OK] Webhook listener authenticated', '[OK] Trigger verified'],
  },
  {
    id: 'hist-3',
    status: 'failed',
    testName: 'Inspect Element Trigger',
    trigger: 'GitHub PR #113',
    durationM: 1.83,
    reportId: 'rep-113-1',
    timestamp: '42 mins ago',
    stepsCount: 6,
    errorMessage: 'Target element .login-btn detached during DOM reconciliation',
    consoleLogs: ['[WARN] Selector .login-btn timed out after 10000ms', '[ERROR] Node failure in step 4'],
  },
  {
    id: 'hist-4',
    status: 'failed',
    testName: 'Webhook Check Trigger',
    trigger: 'GitHub PR #113',
    durationM: 1.85,
    reportId: 'rep-113-2',
    timestamp: '1 hour ago',
    stepsCount: 5,
    errorMessage: 'Webhook handshake returned status 403 Forbidden',
    consoleLogs: ['[INFO] Connecting to webhook listener', '[ERROR] Secret token mismatch'],
  },
  {
    id: 'hist-5',
    status: 'failed',
    testName: 'Repository Test',
    trigger: 'GitHub PR #113',
    durationM: 1.90,
    reportId: 'rep-113-3',
    timestamp: '2 hours ago',
    stepsCount: 7,
    errorMessage: 'Assertion failed: expected 5 branch policies, received 4',
  },
  {
    id: 'hist-6',
    status: 'failed',
    testName: 'Database Test',
    trigger: 'GitHub PR #112',
    durationM: 13.45,
    reportId: 'rep-112-1',
    timestamp: '3 hours ago',
    stepsCount: 12,
    errorMessage: 'Connection pool timeout after 13.45 minutes',
  },
  {
    id: 'hist-7',
    status: 'failed',
    testName: 'Database Test',
    trigger: 'GitHub PR #112',
    durationM: 13.45,
    reportId: 'rep-112-2',
    timestamp: '4 hours ago',
    stepsCount: 12,
    errorMessage: 'Deadlock detected during concurrent schema migration',
  },
  {
    id: 'hist-8',
    status: 'failed',
    testName: 'Implement Visual Regression Test',
    trigger: 'GitHub PR #113',
    durationM: 13.45,
    reportId: 'rep-113-4',
    timestamp: '5 hours ago',
    stepsCount: 15,
    errorMessage: 'Pixel mismatch threshold exceeded (14.2% diff > 0.5% allowed)',
  },
  {
    id: 'hist-9',
    status: 'failed',
    testName: 'Implement Visual Regression Test',
    trigger: 'GitHub PR #113',
    durationM: 13.45,
    reportId: 'rep-113-5',
    timestamp: '6 hours ago',
    stepsCount: 15,
    errorMessage: 'Pixel mismatch on Safari WebKit rendering',
  },
  {
    id: 'hist-10',
    status: 'failed',
    testName: 'Implement Visual Regression Test',
    trigger: 'GitHub PR #113',
    durationM: 13.45,
    reportId: 'rep-113-6',
    timestamp: '7 hours ago',
    stepsCount: 15,
    errorMessage: 'Font rasterization difference detected',
  },
];


```

### `src/utils/useClickOutside.ts`

```typescript
import { useEffect, type RefObject } from 'react';

export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void
) {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onOutside();
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onOutside]);
}
```

### `src/utils/validate.ts`

```typescript
import { TestNode } from '../types';

export function validateNode(node: TestNode): string | null {
  if (node.errorMessage) return node.errorMessage;

  if (node.type === 'navigate') {
    return /^https?:\/\/\S+$/.test(node.data.url || '')
      ? null
      : 'Enter a valid http(s) URL';
  }

  if (node.type === 'assert' && node.data.assertionType === 'url_contains') {
    return node.data.expectedValue ? null : 'Expected URL text is required';
  }

  if (!('selector' in node.data) || !node.data.selector.trim()) {
    return 'Selector is required';
  }

  if (
    node.type === 'assert' &&
    ['text_contains', 'text_equals', 'has_value'].includes(node.data.assertionType) &&
    !node.data.expectedValue
  ) {
    return 'Expected value is required';
  }

  return null;
}
```

### `src/components/DashboardCards.tsx`

```tsx
import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Workflow,
  Plus,
  Play,
  ArrowRight,
  Kanban,
  GitBranch,
  ArrowUp,
  MoreVertical,
  Activity,
  Bug,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { TestSuite, TestRunResult, JiraIssue, BranchInfo } from '../types';
import { UserAvatar } from './UserAvatar';

interface DashboardCardsProps {
  suites: TestSuite[];
  testRuns: TestRunResult[];
  jiraIssues?: JiraIssue[];
  currentBranch?: string;
  branches?: BranchInfo[];
  onOpenSuiteInBuilder: (suiteId: string) => void;
  onCreateNewSuite: () => void;
  onNavigateToBuilder: () => void;
  onNavigateToJira?: () => void;
  onOpenJsonModal: () => void;
  onTriggerQuickRun: (suiteId: string) => void;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  suites,
  testRuns,
  jiraIssues = [],
  currentBranch = 'feature/checkout-fix',
  onOpenSuiteInBuilder,
  onCreateNewSuite,
  onNavigateToBuilder,
  onNavigateToJira,
  onTriggerQuickRun,
}) => {
  const totalRuns = testRuns.length;
  const passedRuns = testRuns.filter((r) => r.status === 'passed').length;
  const passRate = totalRuns > 0 ? Math.round((passedRuns / totalRuns) * 100) : null;
  const inProgress = jiraIssues.filter((issue) => issue.status === 'inprogress');
  const done = jiraIssues.filter((issue) => issue.status === 'done').length;
  const totalIssues = jiraIssues.length;
  const donePct = totalIssues ? Math.round((done / totalIssues) * 100) : 0;
  const linkedCount = jiraIssues.filter((issue) => issue.linkedSuiteId).length;
  const linkedPct = totalIssues ? Math.round((linkedCount / totalIssues) * 100) : 0;
  const latestRun = testRuns[0];
  const healthy = !latestRun || latestRun.status !== 'failed';

  return (
    <div id="dashboard-container" className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-slate-200">
      {/* Top Welcome & Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">
            Dashboard Overview
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Local run and issue summary</span>
            <span>·</span>
            <span>Active branch: <code className="text-teal-400 font-mono">{currentBranch}</code></span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onNavigateToBuilder}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-semibold tracking-tight transition-all cursor-pointer"
          >
            <Workflow className="w-3.5 h-3.5 text-teal-400" />
            <span>Open Canvas</span>
          </button>
          <button
            onClick={onCreateNewSuite}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold tracking-tight transition-all shadow-sm shadow-teal-500/20 cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Workflow</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards (Matching Screenshot 1 exactly with refined engineering typography) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: System Health */}
        <div className={`bg-slate-900 border border-slate-800 border-t-2 ${healthy ? 'border-t-emerald-400' : 'border-t-rose-400'} rounded-lg p-5 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-colors`}>
          <div className="flex items-center justify-between text-slate-400 text-xs tracking-wider">
            <span>System Health</span>
            <div className={`w-2.5 h-2.5 rounded-full ${healthy ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${healthy ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/15 border-rose-500/30 text-rose-400'}`}>
              {healthy ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            </div>
            <div>
              <div className={`text-xl font-bold tracking-tight ${healthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                {healthy ? 'Healthy' : 'Last run failed'}
              </div>
              <div className="text-xs text-slate-400">{latestRun ? latestRun.timestamp : 'No runs yet'}</div>
            </div>
          </div>
        </div>

        {/* Metric 2: Recent Test Run Summary */}
        <div className="bg-slate-900 border border-slate-800 border-t-2 border-t-teal-400 rounded-lg p-5 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs tracking-wider">
            <span>Recent Test Run Summary</span>
            <Activity className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-emerald-400 tabular-nums">
                {passRate === null ? '—' : `${passRate}%`}
              </span>
              <span className="text-xs text-slate-400 font-medium">Pass Rate</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {passedRuns} of {totalRuns} runs passed
            </div>
          </div>
        </div>

        {/* Metric 3: Active Sprint */}
        <div className="bg-slate-900 border border-slate-800 border-t-2 border-t-purple-400 rounded-lg p-5 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs tracking-wider">
            <span>Active Sprint</span>
            <span className="text-xs text-teal-400">Issue progress</span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold tracking-tight text-slate-100 tabular-nums">
                {done} / {totalIssues}
              </span>
              <span className="text-xs text-teal-400 font-medium">{linkedPct}% Linked</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800">
              <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: `${donePct}%` }} />
            </div>
          </div>
        </div>

        {/* Metric 4: In-Progress Tasks */}
        <div className="bg-slate-900 border border-slate-800 border-t-2 border-t-amber-400 rounded-lg p-5 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs tracking-wider">
            <span>In-Progress Tasks</span>
            <Bug className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-100 tabular-nums">
                {inProgress.length} / {totalIssues}
              </span>
              <span className="text-xs text-amber-400 font-medium">Tickets</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Currently in progress</div>
          </div>
        </div>
      </div>

      {/* In-Progress Tasks Section (Matching Screenshot 1 exactly) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-slate-100">
              In-Progress Tasks
            </h3>
            <span className="text-xs text-slate-400">· Issue backlog</span>
          </div>
          <button
            onClick={onNavigateToJira}
            className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View Board</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Task Items Grid */}
        <div className="space-y-3">
          {inProgress.length ? inProgress.map((issue) => (
            <div
              key={issue.id}
              onClick={() => issue.linkedSuiteId && onOpenSuiteInBuilder(issue.linkedSuiteId)}
              className={`p-4 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-teal-500/40 transition-all flex items-center justify-between group ${issue.linkedSuiteId ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <ArrowUp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-teal-400 font-medium">{issue.key}</span>
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-teal-300 transition-colors truncate">
                      {issue.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <UserAvatar name={issue.assignee.name} size="xs" />
                    <span>{issue.assignee.name}</span>
                    <span>·</span>
                    <span className="truncate">{issue.linkedSuiteName || 'No linked suite'}</span>
                  </div>
                </div>
              </div>

              {issue.linkedSuiteId && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onTriggerQuickRun(issue.linkedSuiteId!);
                  }}
                  className="p-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-teal-300 transition-colors shrink-0"
                  title={`Quick run ${issue.linkedSuiteName || 'linked suite'}`}
                  aria-label={`Quick run ${issue.linkedSuiteName || 'linked suite'}`}
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )) : (
            <div className="p-4 text-sm text-slate-400">No issues are currently in progress.</div>
          )}
        </div>

        {/* Center Prominent Button: Create New Workflow (matching screenshot 1) */}
        <div className="pt-2 flex justify-center">
          <button
            id="dashboard-btn-create-workflow"
            onClick={onCreateNewSuite}
            className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 text-xs font-semibold tracking-tight transition-all shadow-md shadow-teal-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Workflow</span>
          </button>
        </div>
      </div>

      {/* Visual Sequences & Recent Runs Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Sequences List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-semibold text-slate-200 tracking-tight flex items-center gap-2">
              <Workflow className="w-3.5 h-3.5 text-teal-400" />
              <span>ACTIVE TEST SEQUENCES</span>
            </h3>
            <span className="text-xs text-slate-400 tabular-nums">
              {suites.length} suites
            </span>
          </div>

          <div className="space-y-2">
            {suites.map((suite) => (
              <div
                key={suite.id}
                onClick={() => onOpenSuiteInBuilder(suite.id)}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800/60 hover:border-teal-500/40 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <div className="text-xs font-medium text-slate-200 group-hover:text-teal-300 transition-colors">
                    {suite.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {suite.nodes.length} steps · Browser: {suite.targetBrowser} · {suite.updatedAt}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTriggerQuickRun(suite.id);
                    }}
                    className="p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-teal-300 transition-colors"
                    title="Quick Execute"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jira Traceability Matrix Link Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-semibold text-slate-200 tracking-tight flex items-center gap-2">
              <Kanban className="w-3.5 h-3.5 text-purple-400" />
              <span>JIRA TRACEABILITY COVERAGE</span>
            </h3>
            <span className="text-xs text-slate-400">Local board</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Local issue records can be linked to test suites for coverage tracking.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="text-xs text-slate-400">LINKED STORIES</div>
              <div className="text-lg font-bold text-slate-100 mt-0.5 tabular-nums">
                {jiraIssues.filter((i) => i.linkedSuiteId).length}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="text-xs text-slate-400">TOTAL TICKETS</div>
              <div className="text-lg font-bold text-teal-400 mt-0.5 tabular-nums">
                {jiraIssues.length}
              </div>
            </div>
          </div>

          {onNavigateToJira && (
            <button
              onClick={onNavigateToJira}
              className="w-full mt-2 py-2 px-3 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-teal-300 text-xs font-medium border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Jira Kanban Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

```

### `src/components/JiraBoard.tsx`

```tsx
import React, { useState } from 'react';
import {
  Kanban,
  Plus,
  Search,
  Filter,
  Link2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Equal,
  Bookmark,
  Bug,
  CheckSquare,
  Workflow,
  Sparkles,
  ChevronRight,
  User,
  Tag,
  Layers,
  X,
  ShieldCheck,
} from 'lucide-react';
import { JiraIssue, JiraStatus, JiraPriority, TestSuite } from '../types';
import { UserAvatar } from './UserAvatar';

interface JiraBoardProps {
  issues: JiraIssue[];
  suites: TestSuite[];
  onUpdateIssue: (issue: JiraIssue) => void;
  onLinkTestToIssue: (issueId: string, suiteId: string, suiteName: string) => void;
  onNavigateToBuilder: (suiteId?: string) => void;
  currentBranch: string;
}

const COLUMNS: { id: JiraStatus; label: string; color: string; countColor: string }[] = [
  { id: 'todo', label: 'To Do', color: 'border-slate-800', countColor: 'bg-slate-800 text-slate-300' },
  { id: 'inprogress', label: 'In Progress', color: 'border-teal-500/40', countColor: 'bg-teal-500/10 text-teal-400' },
  { id: 'review', label: 'Review / QA', color: 'border-purple-500/40', countColor: 'bg-purple-500/10 text-purple-400' },
  { id: 'done', label: 'Done', color: 'border-emerald-500/40', countColor: 'bg-emerald-500/10 text-emerald-400' },
];

export const JiraBoard: React.FC<JiraBoardProps> = ({
  issues,
  suites,
  onUpdateIssue,
  onLinkTestToIssue,
  onNavigateToBuilder,
  currentBranch,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [linkingIssueId, setLinkingIssueId] = useState<string | null>(null);
  const [selectedIssueDetail, setSelectedIssueDetail] = useState<JiraIssue | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New ticket state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'story' | 'bug' | 'task'>('story');
  const [newPriority, setNewPriority] = useState<JiraPriority>('medium');
  const [newPoints, setNewPoints] = useState<number>(3);
  const [newDescription, setNewDescription] = useState('');

  // Filtered issues
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.labels.some((l) => l.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = filterPriority === 'all' || issue.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const getPriorityIcon = (priority: JiraPriority) => {
    switch (priority) {
      case 'highest':
        return <ArrowUp className="w-3.5 h-3.5 text-rose-500 stroke-[2.5]" />;
      case 'high':
        return <ArrowUp className="w-3.5 h-3.5 text-amber-500" />;
      case 'medium':
        return <Equal className="w-3.5 h-3.5 text-yellow-500" />;
      case 'low':
        return <ArrowDown className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'story':
        return <Bookmark className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />;
      case 'bug':
        return <Bug className="w-3.5 h-3.5 text-rose-400" />;
      case 'task':
        return <CheckSquare className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Bookmark className="w-3.5 h-3.5 text-teal-400" />;
    }
  };

  const handleMoveStatus = (issue: JiraIssue, newStatus: JiraStatus) => {
    onUpdateIssue({
      ...issue,
      status: newStatus,
      updatedAt: 'Just now',
    });
  };

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const nextNumber =
      Math.max(1000, ...issues.map((issue) => Number.parseInt(issue.key.split('-')[1], 10) || 0)) + 1;

    const newIssue: JiraIssue = {
      id: `PS-${nextNumber}`,
      key: `PS-${nextNumber}`,
      title: newTitle,
      status: 'todo',
      priority: newPriority,
      type: newType,
      storyPoints: newPoints,
      assignee: {
        name: 'Alex Mercer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        role: 'Fullstack QA Lead',
      },
      labels: ['Workspace', 'Branch-Synced'],
      description: newDescription || 'Test automation verification required for quality sign-off.',
      updatedAt: 'Just now',
    };

    onUpdateIssue(newIssue);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  const totalPoints = issues.reduce((acc, curr) => acc + curr.storyPoints, 0);
  const linkedCount = issues.filter((i) => i.linkedSuiteId).length;
  const coveragePercent = Math.round((linkedCount / (issues.length || 1)) * 100);

  return (
    <div id="jira-board-container" className="flex-1 flex flex-col h-full bg-slate-900 text-slate-200 overflow-hidden">
      {/* Board Header & Controls */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Kanban className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-100 tracking-tight">
                  Jira Quality Traceability Board
                </h2>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-teal-400">
                  Sample sprint
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-950/60 border border-teal-800/60 text-teal-300">
                  Branch: {currentBranch}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Local board (not connected to Jira). Link local issues to test suites for traceability.
              </p>
            </div>
          </div>
        </div>

        {/* Traceability KPI & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-400">Automated Coverage:</span>
              <span className="text-teal-400 font-semibold">{coveragePercent}%</span>
            </div>
            <div className="w-px h-3 bg-slate-800" />
            <div className="text-slate-400">
              <span>{linkedCount} / {issues.length} Tests Linked</span>
            </div>
          </div>

          <button
            id="jira-btn-create-ticket"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-all shadow-sm shadow-teal-500/20"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Issue</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-2.5 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between gap-4 text-xs shrink-0">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ticket key, title, or label..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-slate-950/80 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-teal-500/80 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-teal-500/80"
          >
            <option value="all">All Priorities</option>
            <option value="highest">Highest</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 min-w-[1050px] h-full">
          {COLUMNS.map((column) => {
            const columnIssues = filteredIssues.filter((i) => i.status === column.id);

            return (
              <div
                key={column.id}
                id={`kanban-col-${column.id}`}
                className="flex flex-col bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden h-full"
              >
                {/* Column Header */}
                <div
                  className={`p-3 border-b ${column.color} bg-slate-900/90 flex items-center justify-between`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                      {column.label}
                    </span>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded-full font-bold ${column.countColor}`}
                    >
                      {columnIssues.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {columnIssues.map((issue) => {
                    const isLinked = Boolean(issue.linkedSuiteId);

                    return (
                      <div
                        key={issue.id}
                        id={`jira-card-${issue.key}`}
                        onClick={() => setSelectedIssueDetail(issue)}
                        className="bg-slate-950/90 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700/90 rounded-lg p-3.5 transition-all shadow-sm cursor-pointer group flex flex-col justify-between gap-3 relative"
                      >
                        {/* Card Header: Type, Key, Priority */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <div className="flex items-center gap-2 font-mono">
                              {getTypeIcon(issue.type)}
                              <span className="font-semibold text-slate-300 group-hover:text-teal-400 transition-colors">
                                {issue.key}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getPriorityIcon(issue.priority)}
                              <span className="text-xs px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                                {issue.storyPoints} pts
                              </span>
                            </div>
                          </div>

                          {/* Ticket Title */}
                          <h4 className="text-xs font-medium text-slate-100 line-clamp-2 leading-relaxed">
                            {issue.title}
                          </h4>

                          {/* Labels */}
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {issue.labels.map((label) => (
                              <span
                                key={label}
                                className="text-xs px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800/80 text-slate-400"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Visual Test Traceability Section */}
                        <div className="pt-2.5 border-t border-slate-800/80">
                          {isLinked ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-teal-400 flex items-center gap-1">
                                  <Link2 className="w-3 h-3" />
                                  Linked Visual Test:
                                </span>
                                {issue.testPassRate !== undefined && (
                                  <span className="text-emerald-400 font-bold">
                                    {issue.testPassRate}% Pass
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between bg-slate-900/80 border border-teal-500/30 rounded px-2 py-1.5">
                                <span className="text-xs text-slate-200 truncate max-w-[150px]">
                                  {issue.linkedSuiteName}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onNavigateToBuilder(issue.linkedSuiteId);
                                  }}
                                  className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-0.5"
                                >
                                  <span>Open</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              id={`btn-link-test-${issue.key}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setLinkingIssueId(issue.id);
                              }}
                              className="w-full flex items-center justify-center gap-2 py-1.5 px-2 rounded bg-slate-900 hover:bg-slate-800 text-teal-400 hover:text-teal-300 border border-slate-800 hover:border-teal-500/40 text-xs transition-all"
                            >
                              <Link2 className="w-3 h-3" />
                              <span>Link Visual Test</span>
                            </button>
                          )}
                        </div>

                        {/* Card Footer: Assignee & Move column dropdown */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <UserAvatar name={issue.assignee.name} size="xs" />
                            <span className="text-xs text-slate-400 truncate max-w-[90px]">
                              {issue.assignee.name.split(' ')[0]}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {column.id !== 'todo' && (
                              <button
                                type="button"
                                title="Move Left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const prev = column.id === 'inprogress' ? 'todo' : column.id === 'review' ? 'inprogress' : 'review';
                                  handleMoveStatus(issue, prev);
                                }}
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                              >
                                ←
                              </button>
                            )}
                            {column.id !== 'done' && (
                              <button
                                type="button"
                                title="Move Right"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const next = column.id === 'todo' ? 'inprogress' : column.id === 'inprogress' ? 'review' : 'done';
                                  handleMoveStatus(issue, next);
                                }}
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                              >
                                →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {columnIssues.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center border border-dashed border-slate-800/80 rounded-lg text-slate-600 text-xs">
                      <span>No tickets in {column.label}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Link Visual Test Sequence to Jira Ticket */}
      {linkingIssueId && (
        <div
          id="link-test-modal-backdrop"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLinkingIssueId(null)}
        >
          <div
            id="link-test-modal-card"
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl p-6 text-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  Link Visual Test Sequence
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLinkingIssueId(null)}
                className="p-2 text-slate-400 hover:text-slate-200"
                title="Close link dialog"
                aria-label="Close link dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Select an automated test suite from PlaySight Core to establish continuous verification traceability for ticket{' '}
              <span className="text-teal-400 font-mono font-semibold">
                {issues.find((i) => i.id === linkingIssueId)?.key}
              </span>.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {suites.map((suite) => (
                <button
                  key={suite.id}
                  onClick={() => {
                    onLinkTestToIssue(linkingIssueId, suite.id, suite.name);
                    setLinkingIssueId(null);
                  }}
                  className="w-full text-left p-3 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-teal-500/50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-teal-400 transition-colors">
                      {suite.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {suite.nodes.length} Blocks • {suite.targetBrowser}
                    </div>
                  </div>
                  <Workflow className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setLinkingIssueId(null)}
                className="px-3.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Issue */}
      {isCreateModalOpen && (
        <div
          id="create-issue-modal-backdrop"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            id="create-issue-modal-card"
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl p-6 text-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  Create Jira Story / Bug
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-200"
                title="Close issue dialog"
                aria-label="Close issue dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 uppercase text-xs mb-1">
                  Issue Summary / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Verify Stripe Webhook checkout reconciliation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase text-xs mb-1">
                    Issue Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="story">Story</option>
                    <option value="bug">Bug</option>
                    <option value="task">Task</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase text-xs mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="highest">Highest</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase text-xs mb-1">
                    Story Points
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="13"
                    value={newPoints}
                    onChange={(e) => setNewPoints(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-xs mb-1">
                  Description / Verification Criteria
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline behavior and automated verification prerequisites..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs shadow-sm"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

```

### `src/components/QACopilot.tsx`

```tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  Bot,
  User,
  RotateCcw,
  Zap,
  Code2,
  ExternalLink,
  HelpCircle,
  X,
  PanelRightClose,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { CopilotMessage, TestSuite } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface QACopilotProps {
  isOpen: boolean;
  onClose: () => void;
  messages: CopilotMessage[];
  onSendMessage: (text: string, sender?: 'user' | 'ai') => void;
  onHealNode: (nodeId: string, newSelector: string) => void;
  currentSuite: TestSuite;
  currentBranch: string;
}

export const QACopilot: React.FC<QACopilotProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onHealNode,
  currentSuite,
  currentBranch,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [healedMap, setHealedMap] = useState<Record<string, boolean>>({});
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const respond = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const query = text.toLowerCase();
      const failingNodes = currentSuite.nodes.filter((node) => node.errorMessage);
      let reply: string;

      if (query.includes('flaky') || query.includes('scan')) {
        reply = failingNodes.length
          ? `Found ${failingNodes.length} failing step(s): ${failingNodes.map((node) => `${node.title} (${node.id})`).join(', ')}. Edit the step or review an available auto-heal proposal.`
          : `Scanned ${currentSuite.nodes.length} steps on ${currentBranch}. No failing selectors found.`;
      } else if (query.includes('assert') || query.includes('generate')) {
        reply = `Suggestion for "${currentSuite.name}": add an assertion after the final action, such as checking that the URL contains the expected path or a key element is visible.`;
      } else {
        reply = `I've reviewed "${currentSuite.name}" on ${currentBranch}. Ask me to scan selectors or suggest assertions.`;
      }
      onSendMessage(reply, 'ai');
    }, 700);
  };

  const ask = (text: string) => {
    onSendMessage(text, 'user');
    respond(text);
  };

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputText.trim()) return;
    ask(inputText);
    setInputText('');
  };

  const handleApplyHeal = (nodeId: string, newSelector: string, proposalKey: string) => {
    onHealNode(nodeId, newSelector);
    setHealedMap((prev) => ({ ...prev, [proposalKey]: true }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          id="qa-copilot-panel"
          key="qa-copilot-drawer"
          initial={{ x: '100%', opacity: 0.6 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0.4 }}
          transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          className="w-88 md:w-96 bg-slate-950/85 backdrop-blur-2xl border-l border-slate-800 flex flex-col h-full shrink-0 select-none text-slate-200 shadow-2xl z-30 fixed lg:relative right-0 top-0 bottom-0"
        >
          {/* Copilot Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 relative shadow-sm shadow-teal-500/10">
                <Sparkles className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-teal-400"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-slate-100 tracking-tight font-sans">
                    AI QA Copilot
                  </h3>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                    Agentic
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Branch: {currentBranch}
                </span>
              </div>
            </div>

            <button
              id="btn-close-copilot"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-md transition-colors"
              title="Collapse Panel"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3.5 py-2 border-b border-slate-800 bg-slate-900/30 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <button
              onClick={() => ask('Scan for flaky selectors')}
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-800 whitespace-nowrap transition-colors flex items-center gap-1"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Scan Flaky Selectors</span>
            </button>
            <button
              onClick={() => ask('Generate assertions for this sequence')}
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-800 whitespace-nowrap transition-colors flex items-center gap-1"
            >
              <Wand2 className="w-3 h-3 text-teal-400" />
              <span>Auto Assertions</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
            {messages.map((msg, index) => {
              const isAI = msg.sender === 'ai';
              const proposalKey = `proposal-${msg.id}-${index}`;
              const isHealed = healedMap[proposalKey] || msg.healProposal?.applied;

              return (
                <div
                  key={msg.id || index}
                  className={`flex flex-col gap-2 ${isAI ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {isAI ? (
                      <>
                        <Bot className="w-3 h-3 text-teal-400" />
                        <span className="text-teal-400 font-semibold">PlaySight Copilot</span>
                      </>
                    ) : (
                      <>
                        <span>You</span>
                        <User className="w-3 h-3 text-slate-400" />
                      </>
                    )}
                    <span>• {msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`p-3.5 rounded-xl text-xs leading-relaxed max-w-[95%] shadow-sm ${
                      isAI
                        ? 'bg-slate-900/90 border border-slate-800 text-slate-200'
                        : 'bg-teal-500 text-slate-950 font-medium ml-auto shadow-teal-500/10'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Agentic Auto-Heal Card */}
                    {msg.healProposal && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-2.5">
                        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 font-mono text-xs space-y-1.5">
                          <div className="text-xs text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            <span>DOM Mutation Diff</span>
                            <span className="text-teal-400 font-bold">
                              {msg.healProposal.confidence}% Confidence
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-rose-400 bg-rose-950/20 px-2 py-1 rounded border border-rose-900/40">
                            <span className="font-bold">- Old:</span>
                            <code className="text-rose-300">{msg.healProposal.oldSelector}</code>
                          </div>

                          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-900/40">
                            <span className="font-bold">+ New:</span>
                            <code className="text-emerald-300">{msg.healProposal.newSelector}</code>
                          </div>

                          {msg.healProposal.explanation && (
                            <p className="text-xs text-slate-400 font-sans mt-1">
                              {msg.healProposal.explanation}
                            </p>
                          )}
                        </div>

                        {/* Interactive Auto-Heal Button */}
                        {isHealed ? (
                          <div className="w-full py-2 px-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center justify-center gap-2">
                            <Check className="w-3.5 h-3.5" />
                            <span>Node Healed with {msg.healProposal.newSelector}</span>
                          </div>
                        ) : (
                          <button
                            id={`btn-heal-node-${msg.healProposal.targetNodeId}`}
                            onClick={() =>
                              handleApplyHeal(
                                msg.healProposal!.targetNodeId,
                                msg.healProposal!.newSelector,
                                proposalKey
                              )
                            }
                            className="w-full py-2 px-3 rounded-md bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm shadow-teal-500/20 transition-all cursor-pointer"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>Click here to auto-heal the test node</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-500 text-xs font-mono p-2">
                <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-spin" />
                <span>Copilot is analyzing DOM tree...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900/30">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask Copilot about selectors, assertions..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-md pl-3 pr-10 py-2 text-xs text-slate-100 placeholder-slate-500 font-sans focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="absolute right-1.5 p-2 rounded-md bg-teal-500 disabled:opacity-30 text-slate-950 hover:bg-teal-400 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

```

### `src/components/SettingsView.tsx`

```tsx
import React, { useState } from 'react';
import { Terminal, Save } from 'lucide-react';

interface SettingsViewProps {
  currentBranch: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentBranch }) => {
  const [saved] = useState<Record<string, unknown>>(() => {
    try {
      const value = JSON.parse(localStorage.getItem('playsight.settings') || '{}');
      return value && typeof value === 'object' ? value : {};
    } catch {
      return {};
    }
  });
  const [pythonPort, setPythonPort] = useState(String(saved.pythonPort ?? '5005'));
  const [headlessMode, setHeadlessMode] = useState(saved.headlessMode !== false);
  const [slowMo, setSlowMo] = useState(String(saved.slowMo ?? '150'));
  const [defaultTimeout, setDefaultTimeout] = useState(String(saved.defaultTimeout ?? '10000'));
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const port = Number(pythonPort);
    const delay = Number(slowMo);
    const timeout = Number(defaultTimeout);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      setError('Port must be 1-65535');
      return;
    }
    if (!Number.isFinite(delay) || delay < 0 || !Number.isFinite(timeout) || timeout <= 0) {
      setError('Delay must be non-negative and timeout must be positive');
      return;
    }
    setError('');
    localStorage.setItem(
      'playsight.settings',
      JSON.stringify({ pythonPort, headlessMode, slowMo, defaultTimeout })
    );
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-slate-200 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-100">
            Workspace Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure local executor preferences for this browser.
          </p>
        </div>
        {isSaved && (
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md animate-in fade-in">
            ✓ Settings Applied
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Python Bridge Section */}
        <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Terminal className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-semibold tracking-tight text-slate-100">
              Python test_executor.py Configuration
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Executor RPC Port
              </label>
              <input
                type="text"
                value={pythonPort}
                onChange={(e) => setPythonPort(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/80"
              />
              <span className="text-xs text-slate-400 mt-1 block">Local RPC server binding (default: 5005)</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Slow-Mo Delay (ms)
              </label>
              <input
                type="text"
                value={slowMo}
                onChange={(e) => setSlowMo(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/80"
              />
              <span className="text-xs text-slate-400 mt-1 block">Artificial delay for visual step verification</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Default Assertion Timeout (ms)
              </label>
              <input
                type="text"
                value={defaultTimeout}
                onChange={(e) => setDefaultTimeout(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/80"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="headless-toggle"
                checked={headlessMode}
                onChange={(e) => setHeadlessMode(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-white/10 text-teal-500 focus:ring-teal-500/30"
              />
              <label htmlFor="headless-toggle" className="text-xs text-slate-300 select-none cursor-pointer">
                Run browsers in Headless mode on CI
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          {error && <span role="alert" className="mr-4 self-center text-sm text-rose-400">{error}</span>}
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold tracking-tight transition-all shadow-sm shadow-teal-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};

```

### `src/components/Sidebar.tsx`

```tsx
import React, { useRef, useState } from 'react';
import {
  LayoutDashboard,
  Workflow,
  Clock,
  Users,
  Settings,
  GitBranch,
  ChevronDown,
  Layers,
  FileCode2,
  Activity,
  Check,
  Kanban,
} from 'lucide-react';
import { ActiveTab, TestSuite, BranchInfo } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useClickOutside } from '../utils/useClickOutside';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  suites: TestSuite[];
  currentSuiteId: string;
  onSelectSuite: (suiteId: string) => void;
  onOpenJsonModal: () => void;
  branches: BranchInfo[];
  currentBranch: string;
  onSelectBranch: (branch: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  suites,
  currentSuiteId,
  onSelectSuite,
  onOpenJsonModal,
  branches,
  currentBranch,
  onSelectBranch,
}) => {
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const branchRef = useRef<HTMLDivElement>(null);
  useClickOutside(branchRef, () => setIsBranchDropdownOpen(false));

  // Exactly the 5 requested primary navigation links from the user brief
  const primaryNavItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'builder', label: 'Visual Automation Builder', icon: Workflow },
    { id: 'history', label: 'Test Run History', icon: Clock },
    { id: 'team', label: 'Team Hub', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      id="app-sidebar"
      className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between select-none h-screen shrink-0 text-slate-300 z-30 transition-all duration-200"
    >
      {/* Top Section */}
      <div className="flex flex-col">
        {/* PlaySight Logo Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-sm shadow-teal-500/10">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4 4h7a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H4V4z" />
                <path d="M13 12h3a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4h-3v-8z" opacity="0.6" />
                <circle cx="7.5" cy="8" r="1.5" fill="#020617" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100 tracking-tight">
                PlaySight <span className="text-teal-400 font-medium">Core</span>
              </div>
              <div className="text-xs text-slate-400 tracking-wider">
                QUALITY WORKSPACE
              </div>
            </div>
          </div>
          <span className="text-xs text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded">
            v2.4
          </span>
        </div>

        {/* Primary Navigation Links */}
        <nav className="p-3 space-y-1">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-teal-500/10 text-teal-300 border border-teal-500/25 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate tracking-tight">{item.label}</span>

                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-teal-400"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}

          {/* Integrated Jira Traceability Link */}
          <button
            id="sidebar-nav-jira"
            onClick={() => onSelectTab('jira')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
              activeTab === 'jira'
                ? 'bg-purple-500/10 text-purple-300 border border-purple-500/25 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <Kanban
                className={`w-4 h-4 shrink-0 transition-colors ${
                  activeTab === 'jira' ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span className="truncate tracking-tight">Jira Kanban Board</span>
            </div>
          </button>
        </nav>

        {/* Active Test Sequences Picker */}
        <div className="px-3 pt-2">
          <div className="px-2 pb-1.5 flex items-center justify-between text-xs font-medium text-slate-400 tracking-wider">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Active Sequences
            </span>
            <span className="text-xs text-slate-400 tabular-nums">
              {suites.length}
            </span>
          </div>

          <div className="space-y-1 mt-1">
            {suites.slice(0, 3).map((suite) => {
              const isSelected = suite.id === currentSuiteId && activeTab === 'builder';
              return (
                <button
                  key={suite.id}
                  id={`suite-select-${suite.id}`}
                  onClick={() => {
                    onSelectSuite(suite.id);
                    if (activeTab !== 'builder') {
                      onSelectTab('builder');
                    }
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-slate-900 border border-teal-500/30 text-teal-300'
                      : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span className="font-medium truncate text-xs group-hover:text-teal-300 transition-colors">
                    {suite.name}
                  </span>
                  <span className="text-xs text-slate-400 tabular-nums shrink-0 ml-1.5">
                    {suite.nodes.length} steps
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section (Matching Screenshot: System Status & Active Branch) */}
      <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950">
        {/* Branch Selector Dropdown */}
        <div ref={branchRef} className="relative">
          <button
            id="sidebar-branch-selector-btn"
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <GitBranch className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="truncate text-xs font-mono">{currentBranch}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          <AnimatePresence>
            {isBranchDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 bottom-full mb-1 z-40 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden py-1"
              >
                <div className="px-3 py-1 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Select Git Branch
                </div>
                {branches.map((b) => (
                  <button
                    key={b.name}
                    onClick={() => {
                      onSelectBranch(b.name);
                      setIsBranchDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                      b.name === currentBranch
                        ? 'bg-teal-500/10 text-teal-300 border-l-2 border-teal-400'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate text-xs font-mono">{b.name}</span>
                    <span className="text-xs text-slate-400 font-mono">{b.commit}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* System Status: Clean, Authentic Telemetry (no pill sandwich) */}
        <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Workspace mode:</span>
            <span className="text-xs font-semibold text-amber-400">Local demo</span>
          </div>
          <div>
            <div className="text-xs text-slate-400">Active Branch:</div>
            <div className="text-xs font-mono text-teal-300 truncate">
              {currentBranch}
            </div>
          </div>
        </div>

        {/* Python Executor RPC Bridge Quick Action */}
        <button
          onClick={onOpenJsonModal}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-900/50 hover:bg-slate-900 text-slate-300 hover:text-slate-100 border border-slate-800 text-xs font-mono transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs">test_executor.py</span>
          </div>
          <span className="text-xs text-slate-400">JSON</span>
        </button>
      </div>
    </aside>
  );
};

```

### `src/components/TeamHub.tsx`

```tsx
import React, { useState } from 'react';
import {
  Send,
  Users,
  Calendar,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { TeamMessage } from '../types';
import { MOCK_TEAM_MESSAGES } from '../data/mockData';
import { UserAvatar } from './UserAvatar';

interface TeamHubProps {
  currentBranch: string;
}

export const TeamHub: React.FC<TeamHubProps> = ({ currentBranch }) => {
  const [messages, setMessages] = useState<TeamMessage[]>(MOCK_TEAM_MESSAGES);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg: TeamMessage = {
      id: `tm-${Date.now()}`,
      sender: 'Prakash S.',
      handle: 'prakash.s',
      avatar: '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: newMessage.trim(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage('');
  };

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const calendarDays: Array<{ day: string | number; empty?: boolean; isCurrent?: boolean }> = [
    ...Array.from({ length: offset }, () => ({ day: '', empty: true })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      day: index + 1,
      isCurrent: index + 1 === now.getDate(),
    })),
  ];
  const monthLabel = now.toLocaleString('en', { month: 'short', year: 'numeric' });

  const teamMembers = [
    {
      name: 'Daniel Jones',
      role: 'Staff Quality Engineer',
    },
    {
      name: 'Sarah Jenkins',
      role: 'SDET II - Core Engine',
    },
    {
      name: 'Mike Thomas',
      role: 'Platform Engineering Lead',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-slate-200 max-w-7xl mx-auto w-full">
      {/* View Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">
            Team Hub & Settings
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Collaborative quality pod · local demo</span>
            <span>·</span>
            <span>Branch: <code className="text-teal-400 font-mono">{currentBranch}</code></span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-teal-400 text-xs font-mono">
            Local only
          </span>
        </div>
      </div>

      {/* Main Grid: Left Chat & Right Panels (matching screenshot 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Team Hub Stream */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[520px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-sm">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-slate-100">Team Hub</h3>
                  <span className="text-xs text-slate-400">#sprint-qa-automation channel</span>
                </div>
              </div>
              <span className="text-xs text-slate-400">
                Sample team data
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 group">
                  <UserAvatar name={msg.sender} size="md" />
                  <div className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">{msg.sender}</span>
                        <span className="text-xs font-mono text-slate-400">@{msg.handle}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message the quality pod..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-3.5 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all font-sans"
              />
              <button
                type="submit"
                className="p-2 rounded-md bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors font-medium flex items-center justify-center shadow-sm shadow-teal-500/20 cursor-pointer"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Settings Section (matching screenshot 3) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-semibold tracking-tight text-slate-100">Integrations</h3>
              </div>
              <span className="text-xs text-amber-400">
                Not connected
              </span>
            </div>

            <div className="space-y-2">
              {['GitHub', 'Jira Cloud'].map((name) => (
                <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-sm font-semibold text-slate-200">{name}</div>
                  <span className="text-xs text-amber-400">Not connected · configure server-side</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right Column: Team Members & Scheduled Meetings Calendar */}
        <div className="space-y-6">
          {/* Team Members Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-semibold tracking-tight text-slate-100">Sample Team Members</h3>
              </div>
              <span className="text-xs text-slate-400">Local fixture</span>
            </div>

            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/60 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar name={member.name} size="md" />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{member.name}</div>
                      <div className="text-xs text-slate-400">{member.role}</div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">Sample</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled Meetings / Calendar Card (matching screenshot 3) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-semibold tracking-tight text-slate-100">Calendar</h3>
              </div>
                <div className="text-xs text-teal-400">{monthLabel}</div>
            </div>

            {/* Mini Calendar */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 pb-2 border-b border-slate-800 mb-2">
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
                <span>Su</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {calendarDays.map((c, i) => (
                  <div
                    key={i}
                    className={`h-7 flex items-center justify-center rounded text-xs transition-colors ${
                      c.empty
                        ? 'opacity-0'
                        : c.isCurrent
                        ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    {c.day}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

```

### `src/components/TestRunHistory.tsx`

```tsx
import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  X,
  Play,
  RotateCw,
  Terminal,
  FileCode2,
} from 'lucide-react';
import { TestHistoryRecord } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface TestRunHistoryProps {
  records: TestHistoryRecord[];
  currentBranch: string;
  onRunTestAgain?: () => void;
}

export const TestRunHistory: React.FC<TestRunHistoryProps> = ({
  records,
  currentBranch,
  onRunTestAgain,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'passed' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<TestHistoryRecord | null>(null);

  const filteredRecords = records.filter((r) => {
    const matchesFilter = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch =
      r.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.trigger.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-slate-200 max-w-7xl mx-auto w-full">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            Test Run History
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Simulated runs and sample report records</span>
            <span>·</span>
            <span>Branch: <code className="text-teal-400 font-mono">{currentBranch}</code></span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tests, commits, PRs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="all">All Results</option>
            <option value="passed">Success Only</option>
            <option value="failed">Errors Only</option>
          </select>
        </div>
      </div>

      {/* Test Run History Table (matching screenshot 4) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-xs tracking-wider text-slate-400">
                <th className="py-3 px-5 font-medium">Status</th>
                <th className="py-3 px-5 font-medium">Test Name</th>
                <th className="py-3 px-5 font-medium">Trigger</th>
                <th className="py-3 px-5 font-medium">Duration</th>
                <th className="py-3 px-5 font-medium text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-sans">
              {filteredRecords.map((record) => {
                const isSuccess = record.status === 'passed';
                return (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedReport(record)}
                  >
                    {/* Status Badge: Clean unboxed indicator */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {isSuccess ? (
                        <div className="inline-flex items-center gap-2 text-emerald-400 text-xs">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Success</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 text-rose-400 text-xs">
                          <XCircle className="w-4 h-4 shrink-0" />
                          <span>Error</span>
                        </div>
                      )}
                    </td>

                    {/* Test Name */}
                    <td className="py-3.5 px-5 font-medium text-slate-200 group-hover:text-teal-300 transition-colors">
                      {record.testName}
                    </td>

                    {/* Trigger */}
                    <td className="py-3.5 px-5 font-mono text-slate-400 text-xs">
                      {record.trigger}
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-5 font-mono text-slate-300 text-xs tabular-nums">
                      {(record.durationM * 60).toFixed(1)}s
                    </td>

                    {/* Report link */}
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(record);
                        }}
                        className="text-teal-400 hover:text-teal-300 text-xs underline underline-offset-4 decoration-teal-500/40 hover:decoration-teal-400 transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Report</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Modal Detail Drawer */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-200"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      selectedReport.status === 'passed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {selectedReport.status === 'passed' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-slate-100">
                      {selectedReport.testName}
                    </h3>
                    <div className="text-xs font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{selectedReport.trigger}</span>
                      <span>·</span>
                      <span className="tabular-nums">{(selectedReport.durationM * 60).toFixed(1)}s duration</span>
                      <span>·</span>
                      <span>{selectedReport.timestamp}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Close report"
                  aria-label="Close report"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto font-mono text-xs">
                {selectedReport.errorMessage && (
                  <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-900/50 text-rose-300 space-y-1">
                    <div className="font-semibold text-xs uppercase tracking-wider text-rose-400">
                      Failure Diagnostic:
                    </div>
                    <div>{selectedReport.errorMessage}</div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Demo execution output</span>
                    <span className="text-teal-400 font-semibold tabular-nums">
                      {selectedReport.stepsCount} Steps Processed
                    </span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 font-mono text-xs space-y-1">
                    <div className="text-slate-500">
                      [SIM] No browser process is started by this prototype (branch: {currentBranch})
                    </div>
                    <div className="text-teal-400">
                      [SIM] Showing local run data; no executor dispatch occurred
                    </div>
                    {selectedReport.consoleLogs ? (
                      selectedReport.consoleLogs.map((log, i) => (
                        <div
                          key={i}
                          className={log.includes('ERROR') ? 'text-rose-400' : 'text-slate-300'}
                        >
                          {log}
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400">
                        [DEMO] No live DOM snapshot or browser trace is available
                      </div>
                    )}
                    <div className="text-slate-500 pt-2 border-t border-slate-800">
                      [SIM] Result: {selectedReport.status} (in-memory)
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Report Artifact: #{selectedReport.reportId}
                </span>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  Close Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

```

### `src/components/Topbar.tsx`

```tsx
import React, { useRef, useState } from 'react';
import {
  Play,
  RotateCw,
  RotateCcw,
  GitBranch,
  ChevronDown,
  Search,
  Bell,
  Code2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Check,
  Sparkles,
  Command,
} from 'lucide-react';
import { ActiveTab, TestSuite, BranchInfo, JiraIssue, TestRunResult } from '../types';
import { UserAvatar } from './UserAvatar';
import { motion, AnimatePresence } from 'motion/react';
import { useClickOutside } from '../utils/useClickOutside';

interface TopbarProps {
  activeTab: ActiveTab;
  currentSuite: TestSuite;
  suites: TestSuite[];
  issues: JiraIssue[];
  testRuns: TestRunResult[];
  isRunning: boolean;
  onRunTest: () => void;
  onOpenJsonModal: () => void;
  onResetSuite: () => void;
  onBrowserChange: (browser: 'chromium' | 'firefox' | 'webkit') => void;
  branches: BranchInfo[];
  currentBranch: string;
  onSelectBranch: (branch: string) => void;
  onOpenSuite: (id: string) => void;
  onOpenJira: () => void;
  isCopilotOpen: boolean;
  onToggleCopilot: () => void;
  hasHealAlert?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  currentSuite,
  suites,
  issues,
  testRuns,
  isRunning,
  onRunTest,
  onResetSuite,
  onOpenJsonModal,
  onBrowserChange,
  branches,
  currentBranch,
  onSelectBranch,
  onOpenSuite,
  onOpenJira,
  isCopilotOpen,
  onToggleCopilot,
  hasHealAlert = false,
}) => {
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const branchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  useClickOutside(branchRef, () => setIsBranchMenuOpen(false));
  useClickOutside(notificationsRef, () => setIsNotificationsOpen(false));

  const query = searchQuery.trim().toLowerCase();
  const searchResults = query
    ? [
        ...suites
          .filter((suite) => suite.name.toLowerCase().includes(query))
          .map((suite) => ({
            key: suite.id,
            label: suite.name,
            hint: 'Suite',
            go: () => onOpenSuite(suite.id),
          })),
        ...issues
          .filter((issue) => `${issue.key} ${issue.title}`.toLowerCase().includes(query))
          .map((issue) => ({
            key: issue.id,
            label: `${issue.key} · ${issue.title}`,
            hint: 'Issue',
            go: onOpenJira,
          })),
      ].slice(0, 6)
    : [];
  const recentRuns = testRuns.slice(0, 3);

  const activeBranchInfo =
    branches.find((b) => b.name === currentBranch) || branches[0];

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'builder':
        return 'Visual Automation Builder';
      case 'history':
        return 'Test Run History';
      case 'team':
        return 'Team Hub & Quality Pod';
      case 'settings':
        return 'Workspace Settings';
      case 'jira':
        return 'Jira Quality Traceability';
      default:
        return 'Workspace';
    }
  };

  return (
    <header
      id="app-topbar"
      className="h-16 border-b border-slate-800/80 bg-slate-950 px-6 flex items-center justify-between z-20 shrink-0 select-none text-slate-200"
    >
      {/* Zone 1: Breadcrumbs & Page Title */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>PlaySight</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300 font-medium truncate max-w-[200px]">
              {activeTab === 'builder' ? currentSuite.name : 'Core Workspace'}
            </span>
          </div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-100 mt-0.5">
            {getPageTitle()}
          </h2>
        </div>

        {/* Branch Indicator with Dropdown */}
        <div ref={branchRef} className="relative hidden md:block">
          <button
            id="topbar-branch-selector-btn"
            onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-all cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-mono font-semibold text-xs">{currentBranch}</span>
            <span className="font-mono text-xs text-slate-400">({activeBranchInfo.commit})</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <AnimatePresence>
            {isBranchMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
                id="topbar-branch-menu-dropdown"
                className="absolute left-0 top-full mt-1.5 z-40 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden py-1 w-64 backdrop-blur-xl"
              >
                <div className="px-3 py-1.5 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                  <span>Git Branches</span>
                  <span className="text-teal-400">Local data</span>
                </div>
                {branches.map((b) => (
                  <button
                    key={b.name}
                    onClick={() => {
                      onSelectBranch(b.name);
                      setIsBranchMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      b.name === currentBranch ? 'bg-teal-500/10 text-teal-300' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-mono font-medium text-xs">{b.name}</div>
                      <div className="font-mono text-xs text-slate-400">
                        {b.commit} · {b.lastUpdated}
                      </div>
                    </div>
                    {b.name === currentBranch && <Check className="w-3.5 h-3.5 text-teal-400" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Zone 2: Search bar (Human UX: real search field with keyboard shortcut) */}
      <div className="relative hidden lg:flex items-center">
        <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
        <input
          id="global-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search suites, tickets, nodes..."
          className="w-56 bg-slate-900/90 border border-slate-800 rounded-md pl-8 pr-12 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all font-sans"
        />
        <div className="absolute right-2 flex items-center gap-0.5 text-xs font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 pointer-events-none">
          <span>⌘</span>
          <span>K</span>
        </div>
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
            {searchResults.map((result) => (
              <button
                key={result.key}
                onClick={() => {
                  result.go();
                  setSearchQuery('');
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-left text-slate-200 hover:bg-slate-800"
              >
                <span className="truncate">{result.label}</span>
                <span className="text-xs text-teal-400 ml-3">{result.hint}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zone 3: Direct Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Visual Builder Contextual Controls */}
        {activeTab === 'builder' && (
          <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
            {/* Target Browser Segmented Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5 text-xs">
              {(['chromium', 'firefox', 'webkit'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => onBrowserChange(b)}
                  className={`px-2.5 py-1 rounded text-xs capitalize transition-all cursor-pointer ${
                    currentSuite.targetBrowser === b
                      ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onResetSuite}
              className="p-2 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 transition-colors cursor-pointer"
              title="Reset suite to saved baseline"
              aria-label="Reset suite to saved baseline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Run Sequence Action Button */}
            <button
              id="topbar-run-test-btn"
              onClick={onRunTest}
              disabled={isRunning}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-tight transition-all shadow-sm cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 text-slate-950 cursor-wait'
                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20 active:scale-95'
              }`}
            >
              {isRunning ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Sequence</span>
                </>
              )}
            </button>

            {/* JSON Schema Export */}
            <button
              id="topbar-open-json-btn"
              onClick={onOpenJsonModal}
              className="p-2 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 transition-colors cursor-pointer"
              title="View Python test_executor.py JSON Schema"
            >
              <Code2 className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        )}

        {/* Notifications Popover Toggle */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-md hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer border border-transparent hover:border-slate-800"
            title={hasHealAlert ? 'Notifications: failing test step' : 'Notifications'}
            aria-label={hasHealAlert ? 'Notifications: failing test step' : 'Notifications'}
          >
            <Bell className="w-4 h-4" />
            {hasHealAlert && (
              <span
                aria-hidden="true"
                className="absolute top-2 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-400"
              />
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 text-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400 uppercase">
                  <span>Recent Notifications</span>
                </div>
                <div className="space-y-2 pt-2">
                  {recentRuns.length ? recentRuns.map((run) => (
                    <div key={run.id} className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                      <div className="font-semibold text-slate-200">
                        {run.suiteName} · {run.status === 'passed' ? 'Passed' : run.status === 'failed' ? 'Failed' : 'Running'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {run.passedSteps} of {run.totalSteps} steps · {(run.durationMs / 1000).toFixed(1)}s
                      </div>
                      <div className="text-xs text-teal-400 font-mono mt-1">{run.timestamp}</div>
                    </div>
                  )) : (
                    <div className="p-2 text-slate-400">No test runs yet.</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile (Prakash S. - Authentic Human Representation) */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <UserAvatar name="Prakash S." size="sm" />
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-200 leading-tight">Prakash S.</div>
            <div className="text-xs text-teal-400">Lead QA Engineer</div>
          </div>
        </div>
      </div>
    </header>
  );
};

```

### `src/components/UserAvatar.tsx`

```tsx
import React from 'react';

interface UserAvatarProps {
  name: string;
  role?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const COLOR_PALETTES: Record<string, { bg: string; text: string; border: string }> = {
  'Prakash S.': {
    bg: 'bg-teal-500/20',
    text: 'text-teal-300',
    border: 'border-teal-500/40',
  },
  'Daniel Jones': {
    bg: 'bg-indigo-500/20',
    text: 'text-indigo-300',
    border: 'border-indigo-500/40',
  },
  'Sarah Jenkins': {
    bg: 'bg-rose-500/20',
    text: 'text-rose-300',
    border: 'border-rose-500/40',
  },
  'Sarah J.': {
    bg: 'bg-rose-500/20',
    text: 'text-rose-300',
    border: 'border-rose-500/40',
  },
  'Mike Thomas': {
    bg: 'bg-amber-500/20',
    text: 'text-amber-300',
    border: 'border-amber-500/40',
  },
  'Alex Rivera': {
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-300',
    border: 'border-cyan-500/40',
  },
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 'sm',
  className = '',
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const palette = COLOR_PALETTES[name] || {
    bg: 'bg-slate-800',
    text: 'text-slate-200',
    border: 'border-white/10',
  };

  const sizeClasses = {
    xs: 'w-5 h-5 text-xs',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-9 h-9 text-xs',
  }[size];

  return (
    <div
      title={name}
      className={`rounded-full shrink-0 flex items-center justify-center font-mono font-semibold select-none border transition-transform duration-200 ${palette.bg} ${palette.text} ${palette.border} ${sizeClasses} ${className}`}
    >
      {initials}
    </div>
  );
};

```

### `src/components/VisualBuilder/CanvasArea.tsx`

```tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Globe,
  MousePointerClick,
  Type,
  CheckCircle2,
  Trash2,
  Play,
  ArrowRight,
  GripHorizontal,
  Link,
  Plus,
  HelpCircle,
  Sparkles,
  GitCommit,
  X,
} from 'lucide-react';
import {
  TestNode,
  ConnectionEdge,
  StepType,
  NavigateStepData,
  ClickStepData,
  InputStepData,
  AssertStepData,
} from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface CanvasAreaProps {
  nodes: TestNode[];
  edges: ConnectionEdge[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onUpdateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  onAddNode: (type: StepType, position?: { x: number; y: number }) => void;
  onDeleteNode: (nodeId: string) => void;
  onConnectNodes: (sourceId: string, targetId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onAutoLayout: () => void;
  isRunning: boolean;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onUpdateNodePosition,
  onAddNode,
  onDeleteNode,
  onConnectNodes,
  onDeleteEdge,
  onAutoLayout,
  isRunning,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Quick add menu state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Node dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Connection wire dragging state
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [connectingMousePos, setConnectingMousePos] = useState<{ x: number; y: number } | null>(null);

  // Hovered edge for easy deletion
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  // Node width and height constants for connection port math
  const NODE_WIDTH = 260;
  const NODE_HEIGHT = 135;

  // Handle Drag & Drop from Toolbox
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/testflow-node-type') as StepType;
    if (!type || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const dropX = (e.clientX - rect.left - pan.x) / scale;
    const dropY = (e.clientY - rect.top - pan.y) / scale;

    onAddNode(type, {
      x: Math.max(20, Math.round(dropX - NODE_WIDTH / 2)),
      y: Math.max(20, Math.round(dropY - 40)),
    });
  };

  // Canvas Panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      onSelectNode(null);
      setIsPanning(true);
      setPanStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
    }
  };

  // Node Dragging Start
  const handleNodeMouseDown = (e: React.MouseEvent, node: TestNode) => {
    e.stopPropagation();
    onSelectNode(node.id);
    setDraggingNodeId(node.id);
    setDragOffset({
      x: e.clientX - node.position.x * scale - pan.x,
      y: e.clientY - node.position.y * scale - pan.y,
    });
  };

  // Connection Wire Start
  const handlePortMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnectingSourceId(nodeId);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setConnectingMousePos({
        x: (e.clientX - rect.left - pan.x) / scale,
        y: (e.clientY - rect.top - pan.y) / scale,
      });
    }
  };

  // Connection Wire End (drop on target port)
  const handlePortMouseUp = (e: React.MouseEvent, targetNodeId: string) => {
    e.stopPropagation();
    if (connectingSourceId && connectingSourceId !== targetNodeId) {
      onConnectNodes(connectingSourceId, targetNodeId);
    }
    setConnectingSourceId(null);
    setConnectingMousePos(null);
  };

  // Global Mouse Move & Mouse Up
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      } else if (draggingNodeId && containerRef.current) {
        const newX = (e.clientX - dragOffset.x - pan.x) / scale;
        const newY = (e.clientY - dragOffset.y - pan.y) / scale;
        onUpdateNodePosition(draggingNodeId, {
          x: Math.round(newX),
          y: Math.round(newY),
        });
      } else if (connectingSourceId && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setConnectingMousePos({
          x: (e.clientX - rect.left - pan.x) / scale,
          y: (e.clientY - rect.top - pan.y) / scale,
        });
      }
    };

    const handleMouseUp = () => {
      if (isPanning) setIsPanning(false);
      if (draggingNodeId) setDraggingNodeId(null);
      if (connectingSourceId) {
        setConnectingSourceId(null);
        setConnectingMousePos(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, panStart, draggingNodeId, dragOffset, connectingSourceId, pan, scale, onUpdateNodePosition]);

  // Zoom controls
  const handleZoom = (delta: number) => {
    setScale((prev) => Math.min(Math.max(0.4, Number((prev + delta).toFixed(1))), 2.0));
  };

  const resetView = () => {
    setScale(1);
    setPan({ x: 40, y: 40 });
  };

  // Node lookup map
  const nodeMap = useMemo(() => {
    const map = new Map<string, TestNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Node type visual helpers
  const getTypeConfig = (type: StepType) => {
    switch (type) {
      case 'navigate':
        return {
          icon: Globe,
          label: 'Navigate URL',
          borderColor: 'border-cyan-500/40',
          selectedBorder: 'border-teal-400 ring-2 ring-teal-500/20 shadow-lg shadow-teal-500/10',
          headerBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          badgeText: 'URL',
        };
      case 'click':
        return {
          icon: MousePointerClick,
          label: 'Click Element',
          borderColor: 'border-emerald-500/40',
          selectedBorder: 'border-emerald-400 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10',
          headerBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          badgeText: 'CLICK',
        };
      case 'input':
        return {
          icon: Type,
          label: 'Input Text',
          borderColor: 'border-amber-500/40',
          selectedBorder: 'border-amber-400 ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10',
          headerBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          badgeText: 'INPUT',
        };
      case 'assert':
        return {
          icon: CheckCircle2,
          label: 'Assert Value',
          borderColor: 'border-purple-500/40',
          selectedBorder: 'border-purple-400 ring-2 ring-purple-500/20 shadow-lg shadow-purple-500/10',
          headerBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          badgeText: 'ASSERT',
        };
    }
  };

  const handleQuickAdd = (type: StepType) => {
    // Add next to last node or at center
    const lastNode = nodes[nodes.length - 1];
    const newPos = lastNode
      ? { x: lastNode.position.x + NODE_WIDTH + 60, y: lastNode.position.y }
      : { x: 100, y: 150 };
    onAddNode(type, newPos);
    setIsQuickAddOpen(false);
  };

  return (
    <div
      ref={containerRef}
      id="builder-canvas-viewport"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseDown={handleCanvasMouseDown}
      className="flex-1 h-full relative overflow-hidden bg-slate-950 select-none cursor-default"
      style={{
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* Canvas Floating Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg p-1 shadow-lg text-slate-300 text-xs">
        <button
          onClick={() => handleZoom(0.1)}
          className="p-2 hover:bg-slate-800 rounded text-slate-300 hover:text-teal-400 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <span className="px-1 text-xs text-slate-400 min-w-[40px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => handleZoom(-0.1)}
          className="p-2 hover:bg-slate-800 rounded text-slate-300 hover:text-teal-400 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-slate-800 mx-0.5" />
        <button
          onClick={resetView}
          className="p-2 hover:bg-slate-800 rounded text-slate-300 hover:text-teal-400 transition-colors"
          title="Reset View (100%)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onAutoLayout}
          className="flex items-center gap-1 px-2 py-1 hover:bg-slate-800 rounded text-slate-300 hover:text-teal-400 transition-colors text-xs"
          title="Auto arrange sequence horizontally"
        >
          <GitCommit className="w-3.5 h-3.5" />
          <span>Auto Layout</span>
        </button>
      </div>

      {/* Floating Instructions Banner */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 text-center p-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-teal-400 mb-4 shadow-xl">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">Sequence Canvas is Empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
            Drag blocks from the Toolbox on the left, or click the templates to populate an end-to-end automation test suite.
          </p>
        </div>
      )}

      {/* Scaled and Panned Workspace Layer */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
        className="w-full h-full absolute inset-0 pointer-events-none"
      >
        {/* SVG Canvas for Connection Edges */}
        <svg
          className="w-[5000px] h-[5000px] absolute inset-0 pointer-events-auto"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <marker
              id="edge-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#14b8a6" />
            </marker>
          </defs>

          {/* Render Persistent Edges */}
          {edges.map((edge) => {
            const sId = edge.sourceId || (edge as any).source;
            const tId = edge.targetId || (edge as any).target;
            const sourceNode = nodeMap.get(sId);
            const targetNode = nodeMap.get(tId);
            if (!sourceNode || !targetNode) return null;

            // Connection math: from right-middle of source to left-middle of target
            const x1 = sourceNode.position.x + NODE_WIDTH;
            const y1 = sourceNode.position.y + 60;
            const x2 = targetNode.position.x;
            const y2 = targetNode.position.y + 60;

            const dx = Math.max(40, Math.abs(x2 - x1) * 0.5);
            const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

            const isHovered = hoveredEdgeId === edge.id;

            return (
              <g
                key={edge.id}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredEdgeId(edge.id)}
                onMouseLeave={() => setHoveredEdgeId(null)}
                onClick={() => onDeleteEdge(edge.id)}
              >
                {/* Thick invisible stroke for easier click hit detection */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={20}
                />
                {/* Outer halo on hover */}
                {isHovered && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth={6}
                    strokeOpacity={0.25}
                  />
                )}
                {/* Visible Connection Line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isHovered ? '#f43f5e' : '#14b8a6'}
                  strokeWidth={isHovered ? 2.5 : 2}
                  strokeDasharray={isRunning ? '6,4' : 'none'}
                  className={isRunning ? 'animate-dash' : ''}
                  markerEnd="url(#edge-arrow)"
                />
                {isHovered && (
                  <circle
                    cx={(x1 + x2) / 2}
                    cy={(y1 + y2) / 2}
                    r={9}
                    fill="#f43f5e"
                    className="shadow-md"
                  />
                )}
              </g>
            );
          })}

          {/* Dynamic Active Connection Wire while dragging */}
          {connectingSourceId && connectingMousePos && (
            (() => {
              const src = nodeMap.get(connectingSourceId);
              if (!src) return null;
              const x1 = src.position.x + NODE_WIDTH;
              const y1 = src.position.y + 60;
              const x2 = connectingMousePos.x;
              const y2 = connectingMousePos.y;
              const dx = Math.abs(x2 - x1) * 0.5;
              const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

              return (
                <path
                  d={pathData}
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth={2.5}
                  strokeDasharray="4,4"
                />
              );
            })()
          )}
        </svg>

        {/* Nodes Layer */}
        {nodes.map((node, index) => {
          const isSelected = selectedNodeId === node.id;
          const config = getTypeConfig(node.type);
          const Icon = config.icon;

          return (
            <div
              key={node.id}
              id={`canvas-node-${node.id}`}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(node.id);
              }}
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                width: `${NODE_WIDTH}px`,
              }}
              className={`absolute pointer-events-auto rounded-xl bg-slate-900/95 backdrop-blur-md border transition-all cursor-move select-none ${
                isSelected
                  ? config.selectedBorder
                  : `border-slate-800 hover:border-teal-500/40 shadow-xl`
              } ${
                node.status === 'running'
                  ? 'ring-2 ring-teal-400 animate-pulse border-teal-400'
                  : node.status === 'success'
                  ? 'border-emerald-500/80 shadow-emerald-500/10'
                  : node.status === 'failed'
                  ? 'border-rose-500/80 shadow-rose-500/10'
                  : ''
              }`}
            >
              {/* Left Input Connection Port (Target) */}
              <div
                onMouseUp={(e) => handlePortMouseUp(e, node.id)}
                title="Input connector: drop connection wire here"
                className="absolute -left-2.5 top-[52px] w-5 h-5 rounded-full bg-slate-900 border-2 border-slate-600 hover:border-teal-400 hover:bg-teal-500/20 flex items-center justify-center transition-all cursor-crosshair z-30"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-teal-400"></span>
              </div>

              {/* Right Output Connection Port (Source) */}
              <div
                onMouseDown={(e) => handlePortMouseDown(e, node.id)}
                title="Output connector: drag to connect next step"
                className="absolute -right-2.5 top-[52px] w-5 h-5 rounded-full bg-slate-900 border-2 border-teal-500/80 hover:border-teal-300 hover:bg-teal-500/30 flex items-center justify-center transition-all cursor-crosshair z-30 shadow"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              </div>

              {/* Node Card Header */}
              <div
                className={`px-3 py-2 border-b rounded-t-xl flex items-center justify-between ${config.headerBg}`}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-slate-950/60 border border-white/5">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold tracking-tight text-slate-100 block">
                      {node.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase px-1.5 py-0.5 rounded bg-slate-950/80 border border-white/5 text-slate-400">
                    #{index + 1}
                  </span>
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNode(node.id);
                    }}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                    title="Delete Node"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Node Card Body: Key Parameter Summary */}
              <div className="p-3 text-xs font-mono space-y-1.5 text-slate-400">
                {node.type === 'navigate' && (
                  <div>
                    <div className="text-slate-500 text-xs uppercase">URL Target</div>
                    <div className="text-cyan-300 font-medium truncate">
                      {(node.data as NavigateStepData).url || 'https://...'}
                    </div>
                  </div>
                )}

                {node.type === 'click' && (
                  <div>
                    <div className="text-slate-500 text-xs uppercase">Target Selector</div>
                    <div className="text-emerald-300 font-medium truncate">
                      {(node.data as ClickStepData).selector || 'selector'}
                    </div>
                  </div>
                )}

                {node.type === 'input' && (
                  <div>
                    <div className="text-slate-500 text-xs uppercase">Selector & Text</div>
                    <div className="text-amber-300 font-medium truncate">
                      {(node.data as InputStepData).selector || 'selector'}
                    </div>
                    <div className="text-slate-300 truncate text-xs">
                      Value: {(node.data as InputStepData).maskInput ? '••••••••' : `"${(node.data as InputStepData).value || ''}"`}
                    </div>
                  </div>
                )}

                {node.type === 'assert' && (
                  <div>
                    <div className="text-slate-500 text-xs uppercase">
                      Assert {(node.data as AssertStepData).assertionType}
                    </div>
                    <div className="text-purple-300 font-medium truncate">
                      {(node.data as AssertStepData).selector || 'selector'}
                    </div>
                    {(node.data as AssertStepData).expectedValue && (
                      <div className="text-slate-300 truncate text-xs">
                        == "{(node.data as AssertStepData).expectedValue}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Node Footer / Execution Status */}
              <div className="px-3 py-1.5 border-t border-slate-800 bg-slate-950/60 rounded-b-xl flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">{node.id}</span>
                {node.status === 'running' && (
                  <span className="text-teal-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
                    Executing...
                  </span>
                )}
                {node.status === 'success' && (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    Passed
                  </span>
                )}
                {node.status === 'failed' && (
                  <span className="text-rose-400 flex items-center gap-1 font-semibold">
                    Failed
                  </span>
                )}
                {(!node.status || node.status === 'idle') && (
                  <span className="text-slate-400">Ready</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Center Bottom Plus Button (Matching Screenshot 2 exactly) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        <AnimatePresence>
          {isQuickAddOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="mb-3 p-2 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl flex items-center gap-2"
            >
              <button
                onClick={() => handleQuickAdd('navigate')}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 text-xs flex items-center gap-2 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Navigate</span>
              </button>
              <button
                onClick={() => handleQuickAdd('click')}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 text-xs flex items-center gap-2 transition-colors"
              >
                <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
                <span>Click</span>
              </button>
              <button
                onClick={() => handleQuickAdd('input')}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 text-xs flex items-center gap-2 transition-colors"
              >
                <Type className="w-3.5 h-3.5 text-amber-400" />
                <span>Input</span>
              </button>
              <button
                onClick={() => handleQuickAdd('assert')}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-purple-500/20 text-slate-200 hover:text-purple-300 text-xs flex items-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Assert</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          id="btn-canvas-quick-add"
          onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
          className={`w-11 h-11 rounded-full bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-teal-500/30 transition-all border border-teal-300/40 cursor-pointer ${
            isQuickAddOpen ? 'rotate-45' : ''
          }`}
          title="Add step to workflow"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

```

### `src/components/VisualBuilder/JsonExportModal.tsx`

```tsx
import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileCode2,
  Terminal,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { TestNode, ConnectionEdge } from '../../types';
import { generateExecutorJson } from '../../data/mockData';

interface JsonExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: TestNode[];
  edges: ConnectionEdge[];
  suiteName: string;
  browser: 'chromium' | 'firefox' | 'webkit';
}

export const JsonExportModal: React.FC<JsonExportModalProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
  suiteName,
  browser,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'json' | 'python'>('json');

  if (!isOpen) return null;

  const jsonPayload = generateExecutorJson(nodes, edges, suiteName, browser);
  const jsonString = JSON.stringify(jsonPayload, null, 2);

  const pythonSampleScript = `"""
test_executor.py - Automated End-to-End Test Engine
Consumes exported test sequence JSON from Visual Builder.
"""

import json
import asyncio
import os
from playwright.async_api import async_playwright

async def execute_test_suite(suite_path: str):
    with open(suite_path, 'r') as f:
        data = json.load(f)

    meta = data.get("suite_metadata", {})
    steps = data.get("steps", [])

    print(f"🚀 Starting Test Sequence: {meta.get('name')}")
    print(f"📦 Total Steps to Execute: {len(steps)}")

    async with async_playwright() as p:
        browser_name = meta.get("browser", "chromium")
        browser = await getattr(p, browser_name).launch(
          headless=meta.get("headless", True), slow_mo=meta.get("slow_mo_ms", 100)
        )
        page = await browser.new_page(viewport=meta.get("viewport", {"width": 1280, "height": 800}))

        for step in steps:
            action = step["action"]
            params = step["parameters"]
            print(f"  ▶ [Step {step['step_number']}] {step['title']} ({action})")

            if action == "navigate":
                await page.goto(params["url"], wait_until=params.get("wait_until", "networkidle"), timeout=params.get("timeout_ms", 10000))
            elif action == "click":
              click_type = params.get("click_type", "single")
              await page.click(
                params["selector"],
                click_count=2 if click_type == "double" else 1,
                button="right" if click_type == "right" else "left",
                timeout=params.get("timeout_ms", 5000),
              )
            elif action == "input":
              if params.get("mask_input"):
                secret_name = params.get("secret_env")
                if not secret_name or secret_name not in os.environ:
                  raise RuntimeError(f"Set the {secret_name or 'secret'} environment variable")
                text = os.environ[secret_name]
              else:
                text = params.get("text", "")
              if params.get("clear_first", True):
                await page.fill(params["selector"], "")
              await page.fill(params["selector"], text)
            elif action == "assert":
              kind = params.get("assertion_type", "is_visible")
              selector = params.get("selector")
              expected = params.get("expected_value", "")
              message = params.get("failure_message", "Assertion failed")
              timeout = params.get("timeout_ms", 5000)

              if kind == "is_visible":
                await page.wait_for_selector(selector, state="visible", timeout=timeout)
              elif kind == "text_contains":
                assert expected in await page.inner_text(selector, timeout=timeout), message
              elif kind == "text_equals":
                assert (await page.inner_text(selector, timeout=timeout)).strip() == expected, message
              elif kind == "has_value":
                assert await page.input_value(selector, timeout=timeout) == expected, message
              elif kind == "url_contains":
                assert expected in page.url, message
              else:
                raise ValueError(f"Unsupported assertion type: {kind}")

        print("✅ Test Sequence Execution Succeeded!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(execute_test_suite("test_suite.json"))
`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJsonFile = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${suiteName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-test-suite.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="json-export-modal-backdrop"
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="json-export-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileCode2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                Python <code className="font-mono text-amber-400 text-xs">test_executor.py</code> Payload
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {nodes.length} serialized nodes & topological flow
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
            title="Close export"
            aria-label="Close export"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-mono">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('json')}
              className={`py-2.5 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'json'
                  ? 'border-teal-400 text-teal-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>test_suite.json ({nodes.length} Steps)</span>
            </button>
            <button
              onClick={() => setActiveTab('python')}
              className={`py-2.5 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'python'
                  ? 'border-teal-400 text-teal-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>test_executor.py Sample Runner</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(activeTab === 'json' ? jsonString : pythonSampleScript)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            {activeTab === 'json' && (
              <button
                onClick={downloadJsonFile}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .json</span>
              </button>
            )}
          </div>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto font-mono text-xs bg-slate-950/90 text-slate-300 flex-1">
          {activeTab === 'json' ? (
            <pre className="p-4 rounded-lg bg-slate-900/80 border border-slate-800/80 leading-relaxed overflow-x-auto selection:bg-teal-500/30">
              {jsonString}
            </pre>
          ) : (
            <pre className="p-4 rounded-lg bg-slate-900/80 border border-slate-800/80 leading-relaxed overflow-x-auto text-emerald-300 selection:bg-emerald-500/30">
              {pythonSampleScript}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>CLI dispatch: <code className="text-slate-200">python test_executor.py --suite test_suite.json</code></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

```

### `src/components/VisualBuilder/PropertiesPanel.tsx`

```tsx
import React, { useState } from 'react';
import {
  Globe,
  MousePointerClick,
  Type,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
  Code2,
  Sliders,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import {
  TestNode,
  StepType,
  NavigateStepData,
  ClickStepData,
  InputStepData,
  AssertStepData,
} from '../../types';

interface PropertiesPanelProps {
  selectedNode: TestNode | null;
  onUpdateNode: (nodeId: string, updates: Partial<TestNode>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (node: TestNode) => void;
  onClose: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'json'>('config');

  if (!selectedNode) {
    return (
      <div
        id="builder-properties-panel"
        className="w-80 bg-slate-950/80 backdrop-blur-xl border-l border-slate-800 flex flex-col h-full shrink-0 select-none text-slate-400 p-6 justify-center items-center text-center"
      >
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 mb-3 shadow-inner">
          <Sliders className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200 tracking-tight">Properties Inspector</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-[220px] leading-relaxed">
          Select any block in the canvas to configure its selectors, parameters, and assertions.
        </p>
        <div className="mt-6 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-left w-full text-slate-400">
          <div className="text-slate-300 font-semibold mb-1">Executor Parameters:</div>
          <div>• URL & networkidle state</div>
          <div>• CSS / XPath element targets</div>
          <div>• Input values & password masks</div>
          <div>• Assertion condition checks</div>
        </div>
      </div>
    );
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateNode(selectedNode.id, { title: e.target.value });
  };

  const handleDataChange = (field: string, value: any) => {
    onUpdateNode(selectedNode.id, {
      data: {
        ...selectedNode.data,
        [field]: value,
      } as any,
    });
  };

  const copyNodeJson = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedNode, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="builder-properties-panel"
      className="w-80 bg-slate-950/80 backdrop-blur-xl border-l border-slate-800 flex flex-col h-full shrink-0 select-none text-slate-200 shadow-2xl"
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-100 tracking-tight font-sans">
              Node Properties
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ID: {selectedNode.id}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onDuplicateNode(selectedNode)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
            title="Duplicate Node"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteNode(selectedNode.id)}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
            title="Delete Node"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
            title="Close Inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/30 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('config')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'config'
              ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Configuration
        </button>
        <button
          onClick={() => setActiveTab('json')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'json'
              ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          JSON Schema
        </button>
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        {activeTab === 'json' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 uppercase">Step Payload</span>
              <button
                onClick={copyNodeJson}
                className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-teal-300 overflow-x-auto">
              {JSON.stringify(selectedNode, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Step Title */}
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1">
                Step Title
              </label>
              <input
                type="text"
                value={selectedNode.title}
                onChange={handleTitleChange}
                className="w-full bg-slate-900/80 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-md px-3 py-1.5 text-xs text-slate-100 font-sans focus:outline-none transition-all"
              />
            </div>

            {/* Navigate step parameters */}
            {selectedNode.type === 'navigate' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">
                    Target URL
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as NavigateStepData).url || ''}
                    onChange={(e) => handleDataChange('url', e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-md px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">
                    Wait Condition
                  </label>
                  <select
                    value={(selectedNode.data as NavigateStepData).waitUntil || 'networkidle'}
                    onChange={(e) => handleDataChange('waitUntil', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-md px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                  >
                    <option value="networkidle">networkidle (Recommended)</option>
                    <option value="load">load event</option>
                    <option value="domcontentloaded">domcontentloaded</option>
                  </select>
                </div>
              </div>
            )}

            {/* Click step parameters */}
            {selectedNode.type === 'click' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">
                    CSS / XPath Selector
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as ClickStepData).selector || ''}
                    onChange={(e) => handleDataChange('selector', e.target.value)}
                    placeholder="button#submit"
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-md px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">
                    Click Type
                  </label>
                  <select
                    value={(selectedNode.data as ClickStepData).clickType || 'single'}
                    onChange={(e) => handleDataChange('clickType', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-md px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                  >
                    <option value="single">Single Click</option>
                    <option value="double">Double Click</option>
                    <option value="right">Right Click</option>
                  </select>
                </div>
              </div>
            )}

            {/* Input step parameters */}
            {selectedNode.type === 'input' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">
                    Target Input Selector
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as InputStepData).selector || ''}
                    onChange={(e) => handleDataChange('selector', e.target.value)}
                    placeholder="input[name='email']"
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-md px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">
                    Input Value
                  </label>
                  <input
                    type={(selectedNode.data as InputStepData).maskInput ? 'password' : 'text'}
                    value={(selectedNode.data as InputStepData).value || ''}
                    onChange={(e) => handleDataChange('value', e.target.value)}
                    placeholder="Enter string value..."
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-md px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Assert step parameters */}
            {selectedNode.type === 'assert' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">
                    Assertion Type
                  </label>
                  <select
                    value={(selectedNode.data as AssertStepData).assertionType || 'is_visible'}
                    onChange={(e) => handleDataChange('assertionType', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-md px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                  >
                    <option value="is_visible">Element is visible</option>
                    <option value="text_contains">Text contains</option>
                    <option value="text_equals">Text equals</option>
                    <option value="has_value">Has value</option>
                    <option value="url_contains">URL contains</option>
                  </select>
                </div>
                {(selectedNode.data as AssertStepData).assertionType !== 'url_contains' && <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">
                    Target Selector
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as AssertStepData).selector || ''}
                    onChange={(e) => handleDataChange('selector', e.target.value)}
                    placeholder="h1.title"
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-md px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none transition-all"
                  />
                </div>}
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">
                    Expected Value
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as AssertStepData).expectedValue || ''}
                    onChange={(e) => handleDataChange('expectedValue', e.target.value)}
                    placeholder="Welcome..."
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-md px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

```

### `src/components/VisualBuilder/ToolboxPanel.tsx`

```tsx
import React from 'react';
import {
  Globe,
  MousePointerClick,
  Type,
  CheckCircle2,
  GripVertical,
  Plus,
  Sparkles,
  Info,
} from 'lucide-react';
import { StepType } from '../../types';
import { motion } from 'motion/react';

interface ToolboxBlock {
  type: StepType;
  label: string;
  category: string;
  description: string;
  icon: React.ElementType;
  badgeColor: string;
  borderColor: string;
  accentBg: string;
}

const TOOLBOX_BLOCKS: ToolboxBlock[] = [
  {
    type: 'navigate',
    label: 'Navigate URL',
    category: 'Navigation',
    description: 'Direct browser to target URL with wait condition',
    icon: Globe,
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    borderColor: 'hover:border-cyan-500/40',
    accentBg: 'group-hover:bg-cyan-500/10',
  },
  {
    type: 'click',
    label: 'Click Element',
    category: 'Interaction',
    description: 'Dispatch click event to CSS or XPath selector',
    icon: MousePointerClick,
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    borderColor: 'hover:border-emerald-500/40',
    accentBg: 'group-hover:bg-emerald-500/10',
  },
  {
    type: 'input',
    label: 'Input Text',
    category: 'Interaction',
    description: 'Fill form inputs or send simulated keystrokes',
    icon: Type,
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    borderColor: 'hover:border-amber-500/40',
    accentBg: 'group-hover:bg-amber-500/10',
  },
  {
    type: 'assert',
    label: 'Assert Value',
    category: 'Verification',
    description: 'Verify element state, text content, or URL',
    icon: CheckCircle2,
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    borderColor: 'hover:border-purple-500/40',
    accentBg: 'group-hover:bg-purple-500/10',
  },
];

interface ToolboxPanelProps {
  onAddBlock: (type: StepType) => void;
  onLoadPreset: (presetName: string) => void;
}

export const ToolboxPanel: React.FC<ToolboxPanelProps> = ({ onAddBlock, onLoadPreset }) => {
  const handleDragStart = (e: React.DragEvent, type: StepType) => {
    e.dataTransfer.setData('application/testflow-node-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      id="builder-toolbox-panel"
      className="w-72 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800 flex flex-col h-full shrink-0 select-none text-slate-300"
    >
      {/* Toolbox Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Toolbox
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-teal-400">
            Drag to Canvas
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Drag blocks into the workspace or click <span className="text-teal-400">+</span> to append to your test pipeline.
        </p>
      </div>

      {/* Draggable Blocks List */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3">
        <div className="text-xs uppercase text-slate-400 tracking-wider">
          Step Blocks
        </div>

        {TOOLBOX_BLOCKS.map((block) => {
          const Icon = block.icon;
          return (
            <motion.div
              key={block.type}
              id={`toolbox-item-${block.type}`}
              draggable
              onDragStart={(e) => handleDragStart(e, block.type)}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className={`group relative p-3 bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 ${block.borderColor} rounded-xl cursor-grab active:cursor-grabbing transition-all shadow-sm hover:shadow-[0_8px_20px_-4px_rgba(20,184,166,0.12)] flex flex-col gap-2`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${block.badgeColor}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-slate-100 block tracking-tight">
                      {block.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {block.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onAddBlock(block.type)}
                    title={`Add ${block.label} to canvas`}
                    className="p-2 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-teal-300 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <div className="text-slate-600 group-hover:text-slate-400 cursor-grab p-1">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-snug">
                {block.description}
              </p>
            </motion.div>
          );
        })}

        {/* Quick Templates */}
        <div className="pt-4 mt-2 border-t border-slate-800">
          <div className="text-xs uppercase text-slate-400 tracking-wider mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Templates
            </span>
            <span className="text-xs text-slate-400">Presets</span>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => onLoadPreset('login')}
              className="w-full text-left p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/30 text-xs text-slate-300 hover:text-teal-300 transition-all"
            >
              <div className="font-semibold text-slate-200">E2E Login & Auth Flow</div>
              <div className="text-xs text-slate-400">5 steps: Form, Cookie, Dashboard</div>
            </button>
            <button
              onClick={() => onLoadPreset('checkout')}
              className="w-full text-left p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/30 text-xs text-slate-300 hover:text-teal-300 transition-all"
            >
              <div className="font-semibold text-slate-200">Cart & Checkout E2E</div>
              <div className="text-xs text-slate-400">3 steps: Add item, badge count</div>
            </button>
            <button
              onClick={() => onLoadPreset('search')}
              className="w-full text-left p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/30 text-xs text-slate-300 hover:text-teal-300 transition-all"
            >
              <div className="font-semibold text-slate-200">Search Debounce Filter</div>
              <div className="text-xs text-slate-400">4 steps: Query input, facet assertion</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

```

### `src/components/VisualBuilder/VisualBuilder.tsx`

```tsx
import React, { useState } from 'react';
import { ToolboxPanel } from './ToolboxPanel';
import { CanvasArea } from './CanvasArea';
import { PropertiesPanel } from './PropertiesPanel';
import { QACopilot } from '../QACopilot';
import { orderNodes } from '../../data/mockData';
import {
  TestNode,
  ConnectionEdge,
  StepType,
  TestSuite,
  NavigateStepData,
  ClickStepData,
  InputStepData,
  AssertStepData,
  CopilotMessage,
} from '../../types';

interface VisualBuilderProps {
  suite: TestSuite;
  onUpdateSuite: (updatedSuite: TestSuite) => void;
  onLoadPreset: (presetName: string) => void;
  isRunning: boolean;
  isCopilotOpen: boolean;
  onToggleCopilot: () => void;
  copilotMessages: CopilotMessage[];
  onSendCopilotMessage: (text: string, sender?: 'user' | 'ai') => void;
  onHealNode: (nodeId: string, newSelector: string) => void;
  currentBranch: string;
}

export const VisualBuilder: React.FC<VisualBuilderProps> = ({
  suite,
  onUpdateSuite,
  onLoadPreset,
  isRunning,
  isCopilotOpen,
  onToggleCopilot,
  copilotMessages,
  onSendCopilotMessage,
  onHealNode,
  currentBranch,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    suite.nodes.length > 0 ? suite.nodes[0].id : null
  );

  const selectedNode = suite.nodes.find((n) => n.id === selectedNodeId) || null;

  // Add a new node (via toolbox click or drop)
  const handleAddNode = (type: StepType, position?: { x: number; y: number }) => {
    const nextId = `node-${Date.now().toString().slice(-4)}`;
    let defaultData: any = {};
    let defaultTitle = '';

    if (type === 'navigate') {
      defaultTitle = 'Navigate URL';
      defaultData = {
        url: 'https://staging.app.example.com',
        timeout: 10000,
        waitUntil: 'networkidle',
      } as NavigateStepData;
    } else if (type === 'click') {
      defaultTitle = 'Click Element';
      defaultData = {
        selector: 'button#action-btn',
        clickType: 'single',
        waitForSelector: true,
        timeout: 5000,
      } as ClickStepData;
    } else if (type === 'input') {
      defaultTitle = 'Input Text';
      defaultData = {
        selector: 'input#search-query',
        value: 'Test sample text',
        clearFirst: true,
        maskInput: false,
        timeout: 5000,
      } as InputStepData;
    } else if (type === 'assert') {
      defaultTitle = 'Assert Value';
      defaultData = {
        selector: 'h1.title',
        assertionType: 'is_visible',
        expectedValue: '',
        failureMessage: 'Expected target element was not found in viewport',
        timeout: 5000,
      } as AssertStepData;
    }

    // Determine position: if not provided, place to the right of the rightmost node
    let pos = position;
    if (!pos) {
      const maxX = suite.nodes.reduce((max, n) => Math.max(max, n.position.x), 0);
      pos = { x: maxX > 0 ? maxX + 300 : 80, y: 120 };
    }

    const newNode: TestNode = {
      id: nextId,
      type,
      title: defaultTitle,
      position: pos,
      data: defaultData,
      status: 'idle',
    };

    // Auto-connect to the previous last node if sequential
    const newEdges = [...suite.edges];
    if (suite.nodes.length > 0 && !position) {
      const lastNode = suite.nodes[suite.nodes.length - 1];
      newEdges.push({
        id: `edge-${lastNode.id}-${newNode.id}`,
        sourceId: lastNode.id,
        targetId: newNode.id,
      });
    }

    onUpdateSuite({
      ...suite,
      nodes: [...suite.nodes, newNode],
      edges: newEdges,
      updatedAt: 'Just now',
    });

    setSelectedNodeId(newNode.id);
  };

  // Update position
  const handleUpdateNodePosition = (nodeId: string, position: { x: number; y: number }) => {
    onUpdateSuite({
      ...suite,
      nodes: suite.nodes.map((n) => (n.id === nodeId ? { ...n, position } : n)),
    });
  };

  // Update node data/title
  const handleUpdateNode = (nodeId: string, updates: Partial<TestNode>) => {
    onUpdateSuite({
      ...suite,
      nodes: suite.nodes.map((node) =>
        node.id !== nodeId
          ? node
          : {
              ...node,
              ...updates,
              ...(updates.data ? { errorMessage: undefined, status: 'idle' as const } : {}),
            }
      ),
      updatedAt: 'Just now',
    });
  };

  // Delete a node
  const handleDeleteNode = (nodeId: string) => {
    const remainingNodes = suite.nodes.filter((n) => n.id !== nodeId);
    const remainingEdges = suite.edges.filter(
      (e) => e.sourceId !== nodeId && e.targetId !== nodeId
    );

    onUpdateSuite({
      ...suite,
      nodes: remainingNodes,
      edges: remainingEdges,
      updatedAt: 'Just now',
    });

    if (selectedNodeId === nodeId) {
      setSelectedNodeId(remainingNodes.length > 0 ? remainingNodes[0].id : null);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      ) return;
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId) {
        event.preventDefault();
        handleDeleteNode(selectedNodeId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, suite]);

  // Duplicate a node
  const handleDuplicateNode = (node: TestNode) => {
    const nextId = `node-${Date.now().toString().slice(-4)}`;
    const clonedNode: TestNode = {
      ...node,
      id: nextId,
      title: `${node.title} (Copy)`,
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      data: JSON.parse(JSON.stringify(node.data)),
      status: 'idle',
    };

    onUpdateSuite({
      ...suite,
      nodes: [...suite.nodes, clonedNode],
      updatedAt: 'Just now',
    });

    setSelectedNodeId(clonedNode.id);
  };

  // Connect nodes
  const handleConnectNodes = (sourceId: string, targetId: string) => {
    // Prevent duplicate edges
    const exists = suite.edges.some(
      (e) => e.sourceId === sourceId && e.targetId === targetId
    );
    if (exists || sourceId === targetId) return;

    const newEdge: ConnectionEdge = {
      id: `edge-${sourceId}-${targetId}`,
      sourceId,
      targetId,
    };

    onUpdateSuite({
      ...suite,
      edges: [...suite.edges, newEdge],
      updatedAt: 'Just now',
    });
  };

  // Delete an edge
  const handleDeleteEdge = (edgeId: string) => {
    onUpdateSuite({
      ...suite,
      edges: suite.edges.filter((e) => e.id !== edgeId),
      updatedAt: 'Just now',
    });
  };

  // Auto Layout nodes horizontally in sequential order
  const handleAutoLayout = () => {
    const updatedNodes = orderNodes(suite.nodes, suite.edges).map((node, index) => ({
      ...node,
      position: {
        x: 80 + index * 300,
        y: 120 + (index % 2 === 0 ? 0 : 30),
      },
    }));

    onUpdateSuite({
      ...suite,
      nodes: updatedNodes,
      updatedAt: 'Just now',
    });
  };

  return (
    <div
      id="visual-builder-page"
      className="flex-1 flex overflow-hidden h-[calc(100vh-4rem)] bg-slate-950 select-none relative"
    >
      {/* 1. Left: Toolbox Panel */}
      <ToolboxPanel
        onAddBlock={(type) => handleAddNode(type)}
        onLoadPreset={onLoadPreset}
      />

      {/* 2. Center: Canvas Area */}
      <CanvasArea
        nodes={suite.nodes}
        edges={suite.edges}
        selectedNodeId={selectedNodeId}
        onSelectNode={setSelectedNodeId}
        onUpdateNodePosition={handleUpdateNodePosition}
        onAddNode={handleAddNode}
        onDeleteNode={handleDeleteNode}
        onConnectNodes={handleConnectNodes}
        onDeleteEdge={handleDeleteEdge}
        onAutoLayout={handleAutoLayout}
        isRunning={isRunning}
      />

      {/* 3. Right: Properties Panel */}
      {selectedNode && (
        <PropertiesPanel
          selectedNode={selectedNode}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onDuplicateNode={handleDuplicateNode}
          onClose={() => setSelectedNodeId(null)}
        />
      )}

      {/* 4. AI QA Copilot Panel (Collapsible) */}
      <QACopilot
        isOpen={isCopilotOpen}
        onClose={onToggleCopilot}
        messages={copilotMessages}
        onSendMessage={onSendCopilotMessage}
        onHealNode={onHealNode}
        currentSuite={suite}
        currentBranch={currentBranch}
      />
    </div>
  );
};

```

### `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PlaySight Core | Collaborative Quality Workspace</title>
    <meta name="description" content="AI-powered test automation platform and Collaborative Quality Workspace with Visual Builder, Jira Kanban traceability, and QA Copilot." />
    <meta property="og:title" content="PlaySight Core | Collaborative Quality Workspace" />
    <meta property="og:description" content="AI-powered test automation platform and Collaborative Quality Workspace with Visual Builder, Jira Kanban traceability, and QA Copilot." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>


```

### `vite.config.ts`

```typescript
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}

```

### `package.json`

```json
{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port=3000 --host=0.0.0.0",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "lucide-react": "^0.546.0",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "motion": "^12.23.24"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "autoprefixer": "^10.4.21",
    "tailwindcss": "^4.1.14",
    "typescript": "~5.8.2",
    "vite": "^6.2.3"
  }
}

```

### `.env.example`

```dotenv
# GEMINI_API_KEY: Required for Gemini AI API calls.
# AI Studio automatically injects this at runtime from user secrets.
# Users configure this via the Secrets panel in the AI Studio UI.
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: The URL where this applet is hosted.
# AI Studio automatically injects this at runtime with the Cloud Run service URL.
# Used for self-referential links, OAuth callbacks, and API endpoints.
APP_URL="MY_APP_URL"

```

### `metadata.json`

```json
{
  "name": "PlaySight Core",
  "description": "AI-powered test automation platform and Collaborative Quality Workspace with Visual Builder, Jira Kanban traceability, and QA Copilot.",
  "requestFramePermissions": [],
  "majorCapabilities": ["MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"]
}

```
