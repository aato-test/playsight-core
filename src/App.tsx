import React, { useEffect, useRef, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardCards } from './components/DashboardCards';
import { VisualBuilder } from './components/VisualBuilder/VisualBuilder';
import { JiraBoard } from './components/JiraBoard';
import { TestRunHistory } from './components/TestRunHistory';
import { SettingsView } from './components/SettingsView';
import { EnvironmentsView } from './components/EnvironmentsView';
import { TestDataView } from './components/TestDataView';
import { IntegrationsView } from './components/IntegrationsView';
import { QACopilot } from './components/QACopilot';
import { CommandPalette } from './components/CommandPalette';
import { CreateWorkflowModal } from './components/CreateWorkflowModal';
import { JsonExportModal } from './components/VisualBuilder/JsonExportModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import {
  MOCK_TEST_SUITES,
  MOCK_TEST_RUNS,
  MOCK_JIRA_ISSUES,
  MOCK_BRANCHES,
  INITIAL_COPILOT_MESSAGES,
  MOCK_TEST_HISTORY_RECORDS,
  SAMPLE_PLAYWRIGHT_TRACE,
  orderNodes,
} from './data/mockData';
import { validateNode } from './utils/validate';
import {
  checkBackendHealth,
  fetchSuites,
  fetchRuns,
  saveSuite,
  triggerServerRun,
  fetchGitHubStatus,
  fetchGitHubRepositories,
  fetchGitHubBranches,
  fetchJiraIssues,
} from './services/api';
import {
  ActiveTab,
  TestSuite,
  TestRunResult,
  JiraIssue,
  BranchInfo,
  CopilotMessage,
  TestHistoryRecord,
  TestNode,
  GitHubRepository,
} from './types';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [suites, setSuites] = useState<TestSuite[]>(MOCK_TEST_SUITES);
  const [currentSuiteId, setCurrentSuiteId] = useState<string>(MOCK_TEST_SUITES[0].id);
  const [testRuns, setTestRuns] = useState<TestRunResult[]>(MOCK_TEST_RUNS);
  const [jiraIssues, setJiraIssues] = useState<JiraIssue[]>(MOCK_JIRA_ISSUES);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [currentRepo, setCurrentRepo] = useState<string>('aato-test/playsight-core');
  const [githubConnected, setGithubConnected] = useState<boolean>(true);
  const [branches, setBranches] = useState<BranchInfo[]>(MOCK_BRANCHES);
  const [currentBranch, setCurrentBranch] = useState<string>('main');
  const [currentEnvironment, setCurrentEnvironment] = useState<'local' | 'staging' | 'production'>('staging');
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>(INITIAL_COPILOT_MESSAGES);
  const [history, setHistory] = useState<TestHistoryRecord[]>(MOCK_TEST_HISTORY_RECORDS);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [backendMode, setBackendMode] = useState<string>('in-memory');

  // Modal / Drawer state
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(true);
  const [userName, setUserName] = useState('Prakash Sivakumar');
  const [userEmail, setUserEmail] = useState('prakashsivakumar27@gmail.com');
  const [isRunning, setIsRunning] = useState(false);

  const [notification, setNotification] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  const suitesRef = useRef(suites);
  const runningRef = useRef(false);

  useEffect(() => {
    suitesRef.current = suites;
  }, [suites]);

  // Connect to Backend API & Fetch Real Integrations Data
  useEffect(() => {
    let mounted = true;
    async function initBackend() {
      const health = await checkBackendHealth();
      if (health && mounted) {
        setIsBackendConnected(true);
        setBackendMode(health.mode || 'live');
        const [serverSuites, serverRuns, ghStatus, repos, jira] = await Promise.all([
          fetchSuites(),
          fetchRuns({ limit: 50 }),
          fetchGitHubStatus(),
          fetchGitHubRepositories(),
          fetchJiraIssues(),
        ]);
        if (serverSuites && serverSuites.length > 0 && mounted) {
          setSuites(serverSuites);
          setCurrentSuiteId(serverSuites[0].id);
        }
        if (serverRuns && serverRuns.length > 0 && mounted) {
          setTestRuns(serverRuns);
        }
        if (ghStatus && mounted) {
          setGithubConnected(ghStatus.connected);
        }
        if (repos && repos.length > 0 && mounted) {
          setRepositories(repos);
          setCurrentRepo(repos[0].fullName);
          const repoBranches = await fetchGitHubBranches(repos[0].id);
          if (repoBranches && repoBranches.length > 0 && mounted) {
            setBranches(
              repoBranches.map((b) => ({
                name: b.name,
                commit: b.commitSha.slice(0, 7),
                author: repos[0].ownerLogin,
                pipelineStatus: 'passed',
                ciService: 'GitHub Actions',
                lastUpdated: b.lastCommitAt ? 'Synced' : 'Recently',
              }))
            );
            setCurrentBranch(repos[0].defaultBranch || repoBranches[0].name);
          }
        }
        if (jira && jira.length > 0 && mounted) {
          setJiraIssues(jira);
        }
      }
    }
    initBackend();
    return () => {
      mounted = false;
    };
  }, []);

  const refreshWorkspace = async () => {
    const [ghStatus, repos, jira, serverRuns] = await Promise.all([
      fetchGitHubStatus(),
      fetchGitHubRepositories(),
      fetchJiraIssues(),
      fetchRuns({ limit: 50 }),
    ]);
    if (ghStatus) setGithubConnected(ghStatus.connected);
    if (repos && repos.length > 0) setRepositories(repos);
    if (jira && jira.length > 0) setJiraIssues(jira);
    if (serverRuns && serverRuns.length > 0) setTestRuns(serverRuns);
  };

  const handleSelectRepo = async (repoFullName: string) => {
    setCurrentRepo(repoFullName);
    const repo = repositories.find((r) => r.fullName === repoFullName);
    if (repo) {
      const repoBranches = await fetchGitHubBranches(repo.id);
      if (repoBranches && repoBranches.length > 0) {
        setBranches(
          repoBranches.map((b) => ({
            name: b.name,
            commit: b.commitSha.slice(0, 7),
            author: repo.ownerLogin,
            pipelineStatus: 'passed',
            ciService: 'GitHub Actions',
            lastUpdated: b.lastCommitAt ? 'Synced' : 'Recently',
          }))
        );
        setCurrentBranch(repo.defaultBranch || repoBranches[0].name);
      }
    }
    showNotification(`Switched active repository to ${repoFullName}`);
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const currentSuite =
    suites.find((s) => s.id === currentSuiteId) || suites[0] || MOCK_TEST_SUITES[0];
  const hasFailure = currentSuite.nodes.some(
    (node) => node.status === 'failed' || Boolean(node.errorMessage)
  );

  const showNotification = (
    message: string,
    type: 'success' | 'info' | 'error' = 'success'
  ) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleSaveWorkflow = async () => {
    if (isBackendConnected) {
      const saved = await saveSuite(currentSuite);
      if (saved) {
        showNotification(`Workflow "${currentSuite.name}" saved & synced to API server.`);
        return;
      }
    }
    showNotification('Workflow saved to workspace.');
  };

  // Section 28: Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K: Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      // ⌘J / Ctrl+J: QA Copilot
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsCopilotOpen((prev) => !prev);
      }
      // ⌘Enter / Ctrl+Enter: Run workflow
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunTest();
      }
      // ⌘S / Ctrl+S: Save workflow
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveWorkflow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSuiteId, isBackendConnected, currentSuite]);

  // Update current suite
  const handleUpdateCurrentSuite = (updatedSuite: TestSuite) => {
    setSuites((prev) =>
      prev.map((s) => (s.id === updatedSuite.id ? updatedSuite : s))
    );
    if (isBackendConnected) {
      saveSuite(updatedSuite).catch(() => {});
    }
  };

  // Switch target browser
  const handleBrowserChange = (browser: 'chromium' | 'firefox' | 'webkit') => {
    handleUpdateCurrentSuite({
      ...currentSuite,
      targetBrowser: browser,
      updatedAt: 'Just now',
    });
    showNotification(`Target browser switched to ${browser}`);
  };

  // Switch branch
  const handleSelectBranch = (branchName: string) => {
    setCurrentBranch(branchName);
    const branchInfo = branches.find((b) => b.name === branchName);
    showNotification(`Switched branch to ${branchName} (${branchInfo?.commit})`);
  };

  // Create new workflow sequence
  const handleCreateWorkflow = (newSuite: TestSuite) => {
    setSuites((prev) => [newSuite, ...prev]);
    setCurrentSuiteId(newSuite.id);
    setActiveTab('workflows');
    showNotification(`Created workflow "${newSuite.name}"`);
  };

  // Import from Google Sheets
  const handleImportGoogleTargets = (targets: { url: string; label: string }[]) => {
    if (targets.length === 0) return;
    const nextId = `node-${Date.now().toString().slice(-4)}`;
    const newNodes: TestNode[] = [
      {
        id: `${nextId}-1`,
        type: 'navigate',
        title: `Navigate to ${targets[0].label}`,
        position: { x: 80, y: 140 },
        data: { url: targets[0].url, timeout: 8000, waitUntil: 'load' } as any,
        status: 'idle',
      },
      {
        id: `${nextId}-2`,
        type: 'cookie_banner',
        title: 'Auto-Dismiss Cookie Banner',
        position: { x: 430, y: 140 },
        data: { acceptSelector: 'button:has-text("Accept"), button:has-text("Consent"), #accept-btn', dismissSelector: '', optional: true, timeout: 3000 } as any,
        status: 'idle',
      },
      {
        id: `${nextId}-3`,
        type: 'extract_table',
        title: 'Extract Content / Table Data',
        position: { x: 780, y: 140 },
        data: { selector: 'table, .grid-table, .data-view', variableName: 'sheetScrapedItems', parseHeaders: true, timeout: 8000 } as any,
        status: 'idle',
      },
      {
        id: `${nextId}-4`,
        type: 'export_csv',
        title: 'Export Results to CSV',
        position: { x: 1130, y: 140 },
        data: { datasetVariable: 'sheetScrapedItems', fileName: 'google_sheets_export.csv', delimiter: ',', timeout: 2000 } as any,
        status: 'idle',
      },
    ];
    const newEdges = [
      { id: `e-${nextId}-1-2`, sourceId: `${nextId}-1`, targetId: `${nextId}-2` },
      { id: `e-${nextId}-2-3`, sourceId: `${nextId}-2`, targetId: `${nextId}-3` },
      { id: `e-${nextId}-3-4`, sourceId: `${nextId}-3`, targetId: `${nextId}-4` },
    ];
    const updated = {
      ...currentSuite,
      name: `Google Sheets Ingest: ${targets[0].label}`,
      nodes: newNodes,
      edges: newEdges,
      updatedAt: 'Just now',
    };
    handleUpdateCurrentSuite(updated);
    setActiveTab('workflows');
    showNotification(`Imported ${targets.length} targets from Google Sheets into current suite!`);
  };

  // Update Jira issue
  const handleUpdateJiraIssue = (updatedIssue: JiraIssue) => {
    setJiraIssues((prev) => {
      const exists = prev.some((i) => i.id === updatedIssue.id);
      if (exists) {
        return prev.map((i) => (i.id === updatedIssue.id ? updatedIssue : i));
      }
      return [updatedIssue, ...prev];
    });
    showNotification(`Updated Jira story ${updatedIssue.key}`);
  };

  // Section 25: Auto-Healing Action
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
          confidence: 97,
          source: 'Auto-healed',
          lastExecution: 'Ready (Healed)',
        };
      }
      return node;
    });

    const updatedSuite = {
      ...currentSuite,
      nodes: updatedNodes,
      status: 'passing' as const,
      updatedAt: 'Just now (Auto-healed)',
    };

    handleUpdateCurrentSuite(updatedSuite);

    // 2. Add confirmation message to copilot chat
    const followUpMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `✅ **Auto-heal Successfully Applied!**\nTarget step \`${nodeId}\` selector updated to \`${newSelector}\`.\nConfidence: \`97%\`.\nError state cleared. Test re-run queued for branch \`${currentBranch}\`.`,
    };

    setCopilotMessages((prev) => [...prev, followUpMsg]);

    // 3. Synchronize Jira issue CHK-184 to Review
    setJiraIssues((prev) =>
      prev.map((issue) =>
        issue.key === 'CHK-184' || issue.linkedSuiteId === currentSuite.id
          ? {
              ...issue,
              status: 'review',
              syncStatus: 'auto_healed',
              lastExecution: 'Passed · 1.84s (Healed)',
              conflictReason: undefined,
              lastSyncedAt: 'Just now',
              updatedAt: 'Just now (Auto-healed)',
            }
          : issue
      )
    );

    showNotification(`Selector updated to "${newSelector}" · Test re-run queued`);

    // Queue test re-run automatically after short pause to demonstrate verification
    setTimeout(() => {
      handleRunTest(currentSuite.id);
    }, 800);
  };

  // Send Copilot Message
  const handleSendCopilotMessage = (text: string, sender: 'user' | 'ai' = 'user') => {
    const newMsg: CopilotMessage = {
      id: `msg-${sender}-${Date.now()}`,
      sender,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    };
    setCopilotMessages((prev) => [...prev, newMsg]);
  };

  // Patch node helper
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

  // Simulated Test Execution Pipeline
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
          ? {
              ...item,
              nodes: item.nodes.map((node) => ({ ...node, status: 'idle' as const })),
            }
          : item
      )
    );

    showNotification(`Executing sequence "${suite.name}" on ${suite.targetBrowser}...`, 'info');

    let serverRunResult: TestRunResult | null = null;
    if (isBackendConnected) {
      triggerServerRun({
        suiteId,
        browsers: [suite.targetBrowser],
        environment: currentEnvironment,
        branch: currentBranch,
      })
        .then((res) => {
          if (res) serverRunResult = res;
        })
        .catch(() => {});
    }

    const started = Date.now();
    let passed = 0;
    let failure: string | undefined;
    const logs: string[] = [];

    try {
      for (const node of ordered) {
        patchNode(suiteId, node.id, { status: 'running' });
        await sleep(380);

        const liveNode =
          suitesRef.current.find((item) => item.id === suiteId)?.nodes.find((item) => item.id === node.id) ?? node;

        // Custom validation: check if checkout submit has deprecated selector
        let error = validateNode(liveNode);
        if (
          liveNode.type === 'click' &&
          (liveNode.data as any).selector === '[data-testid="checkout-submit"]'
        ) {
          error = 'Element [data-testid="checkout-submit"] not found within 6000ms (DOM mismatch)';
        }

        if (error) {
          patchNode(suiteId, node.id, {
            status: 'failed',
            errorMessage: error,
            lastExecution: 'Failed · 1.12s',
          });
          failure = `${node.title}: ${error}`;
          logs.push(`[ERROR] ${failure}`);
          break;
        }

        patchNode(suiteId, node.id, {
          status: 'success',
          lastExecution: 'Passed · 380ms',
        });
        logs.push(`[OK] ${node.title}`);
        passed++;
      }
    } catch (err) {
      failure = err instanceof Error ? err.message : 'Unexpected execution error';
      logs.push(`[ERROR] ${failure}`);
    } finally {
      runningRef.current = false;
      setIsRunning(false);
    }

    const durationMs = Date.now() - started;
    const status: 'passed' | 'failed' = failure ? 'failed' : 'passed';
    const browserName = suite.targetBrowser[0].toUpperCase() + suite.targetBrowser.slice(1);
    const id = Date.now().toString().slice(-4);

    const recordedRun: TestRunResult = serverRunResult || {
      id: `run-${id}`,
      suiteId,
      suiteName: suite.name,
      status,
      durationMs,
      totalSteps: ordered.length,
      passedSteps: passed,
      timestamp: 'Just now',
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      browser: `${browserName} 124`,
      triggeredBy: `PlaySight UI (${currentBranch})`,
      traceData: SAMPLE_PLAYWRIGHT_TRACE,
    };

    setTestRuns((prev) => [recordedRun, ...prev]);
    setHistory((prev) => [
      {
        id: `hist-${id}`,
        status: recordedRun.status,
        testName: suite.name,
        trigger: `PlaySight UI · ${currentBranch}`,
        browser: recordedRun.browser,
        durationM: recordedRun.durationMs / 60000,
        reportId: `rep-${id}`,
        timestamp: 'Just now',
        stepsCount: recordedRun.totalSteps,
        errorMessage: failure,
        consoleLogs: logs,
        traceData: recordedRun.traceData || SAMPLE_PLAYWRIGHT_TRACE,
      },
      ...prev,
    ]);

    // Update suite overall status
    setSuites((prev) =>
      prev.map((s) =>
        s.id === suiteId
          ? {
              ...s,
              status: status === 'passed' ? 'passing' : 'needs_attention',
              lastRunTime: 'Just now',
              updatedAt: 'Just now',
            }
          : s
      )
    );

    showNotification(
      failure ? `Execution failed: ${failure}` : `All ${passed} steps passed in ${(durationMs / 1000).toFixed(2)}s`,
      failure ? 'error' : 'success'
    );
  };

  return (
    <div
      id="app-root"
      className="flex h-screen w-screen bg-[#020617] text-[#F8FAFC] overflow-hidden font-sans antialiased"
    >
      {/* 1. Left Sidebar (Section 5) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        suites={suites}
        currentSuiteId={currentSuiteId}
        onSelectSuite={setCurrentSuiteId}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 2. Compact Top Navigation (Section 6) */}
        <Topbar
          activeTab={activeTab}
          currentSuite={currentSuite}
          suites={suites}
          testRuns={testRuns}
          isRunning={isRunning}
          onRunTest={() => handleRunTest()}
          onBrowserChange={handleBrowserChange}
          branches={branches}
          currentBranch={currentBranch}
          onSelectBranch={handleSelectBranch}
          currentRepo={currentRepo}
          onSelectRepo={handleSelectRepo}
          repositories={repositories}
          githubConnected={githubConnected}
          onOpenCopilot={() => setIsCopilotOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          currentEnvironment={currentEnvironment}
          onEnvironmentChange={setCurrentEnvironment}
          hasFailure={hasFailure}
          isBackendConnected={isBackendConnected}
          backendMode={backendMode}
          onNavigateToTab={(tab) => setActiveTab(tab)}
          onOpenGoogleAuth={() => setIsGoogleModalOpen(true)}
          isGoogleSignedIn={isGoogleSignedIn}
          userEmail={userEmail}
        />

        {/* Global Toast Notification */}
        {notification && (
          <div className="fixed top-14 right-6 z-50">
            <div
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded border shadow-xl text-xs font-mono ${
                notification.type === 'success'
                  ? 'bg-[#0F172A] border-teal-500/50 text-teal-300'
                  : notification.type === 'error'
                  ? 'bg-[#0F172A] border-rose-500/50 text-rose-300'
                  : 'bg-[#0F172A] border-amber-500/50 text-amber-300'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* 3. Main Views Routing */}
        <main className="flex-1 overflow-hidden bg-[#020617] flex flex-col relative">
          {activeTab === 'overview' || activeTab === 'dashboard' ? (
            <DashboardCards
              suites={suites}
              testRuns={testRuns}
              jiraIssues={jiraIssues}
              currentBranch={currentBranch}
              onOpenSuiteInBuilder={(suiteId) => {
                setCurrentSuiteId(suiteId);
                setActiveTab('workflows');
              }}
              onCreateNewWorkflow={() => setIsCreateModalOpen(true)}
              onTriggerQuickRun={(suiteId) => {
                setCurrentSuiteId(suiteId);
                handleRunTest(suiteId);
              }}
              onOpenCopilot={() => setIsCopilotOpen(true)}
              onNavigateToTraceability={() => setActiveTab('traceability')}
              isRunning={isRunning}
            />
          ) : activeTab === 'workflows' || activeTab === 'builder' ? (
            <VisualBuilder
              key={currentSuite.id}
              suite={currentSuite}
              onUpdateSuite={handleUpdateCurrentSuite}
              isRunning={isRunning}
              onRunTest={() => handleRunTest()}
              onOpenJsonModal={() => setIsJsonModalOpen(true)}
              onOpenCopilot={() => setIsCopilotOpen(true)}
              onAutoHealTrigger={(nodeId) => {
                setIsCopilotOpen(true);
              }}
            />
          ) : activeTab === 'test-runs' || activeTab === 'history' ? (
            <TestRunHistory
              runs={testRuns}
              currentBranch={currentBranch}
              onTriggerRun={() => handleRunTest()}
              isRunning={isRunning}
            />
          ) : activeTab === 'traceability' || activeTab === 'jira' ? (
            <JiraBoard
              issues={jiraIssues}
              suites={suites}
              onUpdateIssue={handleUpdateJiraIssue}
              onNavigateToBuilder={(suiteId) => {
                if (suiteId) setCurrentSuiteId(suiteId);
                setActiveTab('workflows');
              }}
              onOpenCopilot={() => setIsCopilotOpen(true)}
              currentBranch={currentBranch}
            />
          ) : activeTab === 'test-data' ? (
            <TestDataView currentBranch={currentBranch} />
          ) : activeTab === 'environments' ? (
            <EnvironmentsView
              currentEnvironment={currentEnvironment}
              onEnvironmentChange={setCurrentEnvironment}
              currentBranch={currentBranch}
            />
          ) : activeTab === 'integrations' ? (
            <IntegrationsView currentBranch={currentBranch} onRefreshWorkspace={refreshWorkspace} />
          ) : (
            <SettingsView currentBranch={currentBranch} />
          )}

          {/* QA Copilot Drawer (Section 20) */}
          {isCopilotOpen && (
            <div className="fixed inset-y-0 right-0 z-50 flex">
              <div
                className="fixed inset-0 bg-black/50 transition-opacity"
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

          {/* Floating FAB: QA Copilot (Section 19: 48x48px circular teal button) */}
          {!isCopilotOpen && (
            <button
              id="floating-qa-copilot-btn"
              aria-label="QA Copilot"
              onClick={() => setIsCopilotOpen(true)}
              className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 shadow-xl shadow-teal-500/20 flex items-center justify-center transition-all cursor-pointer border border-teal-300/40 group"
              title="QA Copilot · ⌘J"
            >
              <span className="relative flex items-center justify-center">
                <Sparkles className="w-5 h-5 fill-slate-950" />
                {hasFailure && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 border border-slate-950 animate-pulse" />
                  </span>
                )}
              </span>
            </button>
          )}
        </main>
      </div>

      {/* Global Command Palette (Section 27: ⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setActiveTab}
        onRunCurrentWorkflow={() => handleRunTest()}
        onCreateNewWorkflow={() => setIsCreateModalOpen(true)}
        onAutoLayout={() => {
          showNotification('Arranged nodes in sequence layout');
        }}
        onFitCanvas={() => {
          showNotification('Canvas fitted to view');
        }}
        onEnvironmentChange={setCurrentEnvironment}
        suites={suites}
        onSelectSuite={setCurrentSuiteId}
      />

      {/* Create Workflow Modal (Section 26) */}
      <CreateWorkflowModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateWorkflow={handleCreateWorkflow}
      />

      {/* JSON Schema Exporter */}
      <JsonExportModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        nodes={currentSuite.nodes}
        edges={currentSuite.edges}
        suiteName={currentSuite.name}
        browser={currentSuite.targetBrowser}
      />

      {/* Google Authentication & Imports Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        userEmail={userEmail}
        userName={userName}
        isSignedIn={isGoogleSignedIn}
        onAuthChange={(signedIn, user) => {
          setIsGoogleSignedIn(signedIn);
          setUserName(user.name);
          setUserEmail(user.email);
        }}
        onImportTargets={handleImportGoogleTargets}
      />
    </div>
  );
}
