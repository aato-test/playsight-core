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
import { UploadToGithubModal } from './components/UploadToGithubModal';
import { RepoPagesView } from './components/RepoPagesView';
import { UserSessionModal, UserSession, AuditAction } from './components/UserSessionModal';
import { LoginModal } from './components/LoginModal';
import { ConnectJiraModal } from './components/ConnectJiraModal';
import {
  MOCK_TEST_SUITES,
  PRO_TEST_SUITES,
  MOCK_TEST_RUNS,
  MOCK_JIRA_ISSUES,
  MOCK_BRANCHES,
  INITIAL_COPILOT_MESSAGES,
  MOCK_TEST_HISTORY_RECORDS,
  SAMPLE_PLAYWRIGHT_TRACE,
  ACCOUNT_REPOSITORIES,
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
  fetchJiraStatus,
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
  ConnectionEdge,
  GitHubRepository,
  JiraStatusResponse,
} from './types';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [suites, setSuites] = useState<TestSuite[]>(MOCK_TEST_SUITES);
  const [currentSuiteId, setCurrentSuiteId] = useState<string>(MOCK_TEST_SUITES[0]?.id || '');
  const [testRuns, setTestRuns] = useState<TestRunResult[]>(MOCK_TEST_RUNS);
  const [jiraIssues, setJiraIssues] = useState<JiraIssue[]>(MOCK_JIRA_ISSUES);
  const [repositories, setRepositories] = useState<GitHubRepository[]>(ACCOUNT_REPOSITORIES);
  const [currentRepo, setCurrentRepo] = useState<string>('aato-test/playsight-core');
  const [githubConnected, setGithubConnected] = useState<boolean>(true);
  const [branches, setBranches] = useState<BranchInfo[]>(MOCK_BRANCHES);
  const [currentBranch, setCurrentBranch] = useState<string>('main');
  const [currentEnvironment, setCurrentEnvironment] = useState<'local' | 'staging' | 'production'>('staging');
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>(INITIAL_COPILOT_MESSAGES);
  const [history, setHistory] = useState<TestHistoryRecord[]>(MOCK_TEST_HISTORY_RECORDS);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [backendMode, setBackendMode] = useState<string>('in-memory');

  // 1. Browser Engine state: persists independently so engine switching works immediately
  const [selectedBrowser, setSelectedBrowser] = useState<'chromium' | 'firefox' | 'webkit'>(() => {
    return (localStorage.getItem('playsight_selected_browser') as 'chromium' | 'firefox' | 'webkit') || 'chromium';
  });

  // 2. User Identity & Company Workspace state
  const [userSession, setUserSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem('playsight_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      id: 'usr-1',
      name: 'Prakash Sivakumar',
      email: 'prakashsivakumar27@gmail.com',
      role: 'Lead Automation Engineer',
      organization: 'AATO Technologies',
      workspaceName: 'PlaySight Core Engineering Workspace',
    };
  });

  // 3. Activity Audit Trail: tracks "who did what"
  const [auditLogs, setAuditLogs] = useState<AuditAction[]>(() => {
    const saved = localStorage.getItem('playsight_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'audit-init-1',
        userName: 'Prakash Sivakumar',
        userRole: 'Lead Automation Engineer',
        action: 'Connected GitHub App',
        target: 'aato-test/playsight',
        timestamp: 'Today at 10:15 AM',
        status: 'passed',
      },
    ];
  });

  const logAudit = (action: string, target: string, status: 'passed' | 'failed' | 'info' = 'info') => {
    const newLog: AuditAction = {
      id: `audit-${Date.now()}`,
      userName: userSession.name,
      userRole: userSession.role,
      action,
      target,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status,
    };
    setAuditLogs((prev) => {
      const next = [newLog, ...prev.slice(0, 49)];
      localStorage.setItem('playsight_audit_logs', JSON.stringify(next));
      return next;
    });
  };

  // Jira Status
  const [jiraStatus, setJiraStatus] = useState<JiraStatusResponse | null>(null);

  // Modal / Drawer state
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isUploadGithubOpen, setIsUploadGithubOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isJiraModalOpen, setIsJiraModalOpen] = useState(false);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(true);
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
        const [serverSuites, serverRuns, ghStatus, repos, jira, jStatus] = await Promise.all([
          fetchSuites(),
          fetchRuns({ limit: 50 }),
          fetchGitHubStatus(),
          fetchGitHubRepositories(),
          fetchJiraIssues(),
          fetchJiraStatus(),
        ]);
        const savedRepo = localStorage.getItem('playsight_active_repo');
        let initialRepo = savedRepo || currentRepo;
        if (repos && repos.length > 0 && mounted) {
          setRepositories(repos);
          const found = repos.find((r) => r.fullName.toLowerCase() === initialRepo.toLowerCase());
          if (found) {
            initialRepo = found.fullName;
          } else {
            initialRepo = repos[0].fullName;
          }
          setCurrentRepo(initialRepo);
          const activeRepoObj = found || repos[0];
          const repoBranches = await fetchGitHubBranches(activeRepoObj.id);
          if (repoBranches && repoBranches.length > 0 && mounted) {
            setBranches(
              repoBranches.map((b) => ({
                name: b.name,
                commit: b.commitSha.slice(0, 7),
                author: activeRepoObj.ownerLogin,
                pipelineStatus: 'passed',
                ciService: 'GitHub Actions',
                lastUpdated: b.lastCommitAt ? 'Synced' : 'Recently',
              }))
            );
            setCurrentBranch(activeRepoObj.defaultBranch || repoBranches[0].name);
          }
        }
        const loadedSuites = serverSuites || [];
        const combinedSuites = [
          ...loadedSuites,
          ...PRO_TEST_SUITES.filter((ps) => !loadedSuites.some((ls) => ls.id === ps.id)),
        ];
        if (combinedSuites.length > 0 && mounted) {
          setSuites(combinedSuites);
          const initialSuites = combinedSuites.filter(
            (s) => (s.repositoryFullName || 'aato-test/playsight-core').toLowerCase() === initialRepo.toLowerCase()
          );
          if (initialSuites.length > 0) {
            setCurrentSuiteId(initialSuites[0].id);
          } else {
            setCurrentSuiteId('');
          }
        }
        if (serverRuns && serverRuns.length > 0 && mounted) {
          setTestRuns(serverRuns);
        }
        if (ghStatus && mounted) {
          setGithubConnected(ghStatus.connected);
        }
        if (jira && jira.length > 0 && mounted) {
          setJiraIssues(jira);
        }
        if (jStatus && mounted) {
          setJiraStatus(jStatus);
        }
      }
    }
    initBackend();
    return () => {
      mounted = false;
    };
  }, []);

  const refreshWorkspace = async () => {
    const [ghStatus, repos, jira, serverRuns, jStatus] = await Promise.all([
      fetchGitHubStatus(),
      fetchGitHubRepositories(),
      fetchJiraIssues(),
      fetchRuns({ limit: 50 }),
      fetchJiraStatus(),
    ]);
    if (ghStatus) setGithubConnected(ghStatus.connected);
    if (repos && repos.length > 0) setRepositories(repos);
    if (jira) setJiraIssues(jira);
    if (serverRuns && serverRuns.length > 0) setTestRuns(serverRuns);
    if (jStatus) setJiraStatus(jStatus);
  };

  const handleSelectRepo = async (repoFullName: string) => {
    setCurrentRepo(repoFullName);
    const repo = repositories.find((r) => r.fullName === repoFullName);
    if (repo) {
      try {
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
        } else {
          setBranches([
            {
              name: repo.defaultBranch || 'main',
              commit: '1c54b15',
              author: repo.ownerLogin,
              pipelineStatus: 'passed',
              ciService: 'GitHub Actions',
              lastUpdated: 'Synced',
            },
          ]);
          setCurrentBranch(repo.defaultBranch || 'main');
        }
      } catch {
        setBranches([
          {
            name: repo.defaultBranch || 'main',
            commit: '1c54b15',
            author: repo.ownerLogin,
            pipelineStatus: 'passed',
            ciService: 'GitHub Actions',
            lastUpdated: 'Synced',
          },
        ]);
        setCurrentBranch(repo.defaultBranch || 'main');
      }
    }
    const matchingSuites = suitesRef.current.filter(
      (s) => (s.repositoryFullName || 'aato-test/playsight-core').toLowerCase() === repoFullName.toLowerCase()
    );
    if (matchingSuites.length > 0) {
      setCurrentSuiteId(matchingSuites[0].id);
    } else {
      setCurrentSuiteId('');
    }
    localStorage.setItem('playsight_active_repo', repoFullName);
    showNotification(`Switched active repository to ${repoFullName}`);
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Filter test suites strictly by active repository
  const repoSuites = suites.filter((s) => {
    const suiteRepo = (s.repositoryFullName || 'aato-test/playsight-core').toLowerCase();
    return suiteRepo === currentRepo.toLowerCase();
  });

  const currentSuite =
    repoSuites.find((s) => s.id === currentSuiteId) || repoSuites[0] || null;
  const hasFailure = currentSuite
    ? currentSuite.nodes.some(
        (node) => node.status === 'failed' || Boolean(node.errorMessage)
      )
    : false;

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
    const boundSuite: TestSuite = {
      ...updatedSuite,
      repositoryFullName: updatedSuite.repositoryFullName || currentRepo,
      branchName: updatedSuite.branchName || currentBranch,
    };
    setSuites((prev) =>
      prev.map((s) => (s.id === boundSuite.id ? boundSuite : s))
    );
    if (isBackendConnected) {
      saveSuite(boundSuite).catch(() => {});
    }
  };

  // Switch target browser
  const handleBrowserChange = (browser: 'chromium' | 'firefox' | 'webkit') => {
    setSelectedBrowser(browser);
    localStorage.setItem('playsight_selected_browser', browser);
    if (currentSuite) {
      handleUpdateCurrentSuite({
        ...currentSuite,
        targetBrowser: browser,
        updatedAt: 'Just now',
      });
    }
    const engineLabel =
      browser === 'chromium'
        ? 'Chromium (Chrome)'
        : browser === 'firefox'
        ? 'Firefox'
        : 'WebKit (Safari)';
    logAudit('Switched Browser Engine', engineLabel, 'info');
    showNotification(`Active Browser: ${engineLabel}`);
  };

  // Switch branch
  const handleSelectBranch = (branchName: string) => {
    setCurrentBranch(branchName);
    const branchInfo = branches.find((b) => b.name === branchName);
    showNotification(`Switched branch to ${branchName} (${branchInfo?.commit})`);
  };

  // Create new workflow sequence
  const handleCreateWorkflow = (newSuite: TestSuite) => {
    const boundSuite: TestSuite = {
      ...newSuite,
      repositoryFullName: currentRepo,
      branchName: currentBranch,
      targetBrowser: selectedBrowser,
    };
    if (isBackendConnected) {
      saveSuite(boundSuite).catch((err) => console.warn('Failed to persist suite:', err));
    }
    setSuites((prev) => [boundSuite, ...prev]);
    setCurrentSuiteId(boundSuite.id);
    setActiveTab('workflows');
    logAudit('Created Test Suite', `${boundSuite.name} for ${currentRepo}`, 'passed');
    showNotification(`Created workflow "${boundSuite.name}" for ${currentRepo}`);
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
    if (currentSuite) {
      const updated = {
        ...currentSuite,
        name: `Google Sheets Ingest: ${targets[0].label}`,
        nodes: newNodes,
        edges: newEdges,
        updatedAt: 'Just now',
      };
      handleUpdateCurrentSuite(updated);
    } else {
      const created: TestSuite = {
        id: `suite-${Date.now().toString().slice(-4)}`,
        repositoryFullName: currentRepo,
        branchName: currentBranch,
        name: `Google Sheets Ingest: ${targets[0].label}`,
        description: `Imported targets from Google Sheets for ${currentRepo}`,
        targetBrowser: 'chromium',
        baseUrl: targets[0].url,
        environment: currentEnvironment,
        status: 'passing',
        nodes: newNodes,
        edges: newEdges,
        updatedAt: 'Just now',
      };
      handleCreateWorkflow(created);
    }
    setActiveTab('workflows');
    showNotification(`Imported ${targets.length} targets from Google Sheets into ${currentRepo}!`);
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
    const activeEngine = selectedBrowser || suite.targetBrowser || 'chromium';
    const engineDisplay =
      activeEngine === 'chromium' ? 'Chromium' : activeEngine === 'firefox' ? 'Firefox' : 'WebKit';

    setSuites((prev) =>
      prev.map((item) =>
        item.id === suiteId
          ? {
              ...item,
              targetBrowser: activeEngine,
              nodes: item.nodes.map((node) => ({ ...node, status: 'idle' as const })),
            }
          : item
      )
    );

    showNotification(`Executing sequence "${suite.name}" on ${engineDisplay}...`, 'info');
    logAudit('Triggered Test Run', `${suite.name} on ${engineDisplay}`, 'info');

    let serverRunResult: TestRunResult | null = null;
    if (isBackendConnected) {
      triggerServerRun({
        suiteId,
        browsers: [activeEngine],
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

        // Custom validation: check for deprecated or broken selectors from repository
        let error = validateNode(liveNode);
        const sel = ((liveNode.data as any)?.selector || '').trim();

        if (sel === "//*[@id='inventory_filter_container']/div") {
          error = "Locator //*[@id='inventory_filter_container']/div not found within 6000ms. Root cause in Pages/HomePage.py: SauceDemo v1 container was removed. Modern DOM uses 'span.title' or '[data-test=\"title\"]'.";
        } else if (sel === '.fa-layers-counter') {
          error = "Element .fa-layers-counter not found within 6000ms. Root cause in Pages/HeaderPage.py: Deprecated FontAwesome icon counter was replaced by '.shopping_cart_link' / '.shopping_cart_badge'.";
        } else if (sel === 'a:has-text("CHECKOUT")') {
          error = "Link CHECKOUT not found within 6000ms. Root cause in Pages/CheckoutPage.py: Modern SauceDemo uses button#checkout instead of an anchor link.";
        } else if (sel === '//input[@value="CONTINUE"]') {
          error = "Element //input[@value='CONTINUE'] not found. Modern SauceDemo value is 'Continue' (mixed case), not 'CONTINUE'.";
        } else if (sel === 'a:has-text("FINISH")') {
          error = "Link FINISH not found within 6000ms. Root cause in Pages/CheckoutPage.py: Modern SauceDemo uses button#finish instead of an anchor link.";
        } else if (
          liveNode.type === 'click' &&
          sel === '[data-testid="checkout-submit"]'
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

          // Trigger diagnostic explanation in QA Copilot
          if (sel === "//*[@id='inventory_filter_container']/div") {
            setCopilotMessages((prev) => [
              ...prev,
              {
                id: `copilot-pro-${Date.now()}`,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: '⚠️ **Trouble Root Cause Isolated in aato-test/pro repository:**\n\n- **File:** `Pages/HomePage.py` (line 8)\n- **Failing Locator:** `//*[@id=\'inventory_filter_container\']/div`\n- **Cause:** SauceDemo modernized its DOM structure and completely removed `#inventory_filter_container`. This locator fails every run with `Timeout 6000ms exceeded`.\n- **Recommended Fix:** Update selector to `span.title` or `[data-test="title"]` (96% confidence).',
                diagnostic: {
                  issueType: 'selector_instability',
                  targetSelector: "//*[@id='inventory_filter_container']/div",
                  confidence: 96,
                  reason: 'DOM structure changed: #inventory_filter_container was deprecated in favor of span.title',
                  oldSelector: "//*[@id='inventory_filter_container']/div",
                  newSelector: 'span.title',
                  diff: {
                    removed: "//*[@id='inventory_filter_container']/div",
                    added: 'span.title',
                  },
                  recommendation: 'Update locator to span.title or [data-test="title"]',
                  affectedStepId: node.id,
                  affectedSuiteId: suiteId,
                  linkedJiraKey: 'PRO-101',
                },
                healProposal: {
                  targetNodeId: node.id,
                  oldSelector: "//*[@id='inventory_filter_container']/div",
                  newSelector: 'span.title',
                  confidence: 96,
                  explanation: 'Replaced legacy XPath container with modern header locator span.title.',
                },
              },
            ]);
            setIsCopilotOpen(true);
          } else if (sel === '.fa-layers-counter') {
            setCopilotMessages((prev) => [
              ...prev,
              {
                id: `copilot-pro-cart-${Date.now()}`,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: '⚠️ **Trouble Root Cause in aato-test/pro:**\n\n- **File:** `Pages/HeaderPage.py`\n- **Failing Locator:** `.fa-layers-counter`\n- **Cause:** FontAwesome counter SVG was replaced by `.shopping_cart_link` / `.shopping_cart_badge`.\n- **Recommended Fix:** Update locator to `.shopping_cart_link` (98% confidence).',
                diagnostic: {
                  issueType: 'selector_instability',
                  targetSelector: '.fa-layers-counter',
                  confidence: 98,
                  reason: 'FontAwesome icon was deprecated in modern web layout.',
                  oldSelector: '.fa-layers-counter',
                  newSelector: '.shopping_cart_link',
                  diff: {
                    removed: '.fa-layers-counter',
                    added: '.shopping_cart_link',
                  },
                  recommendation: 'Update locator to .shopping_cart_link',
                  affectedStepId: node.id,
                  affectedSuiteId: suiteId,
                  linkedJiraKey: 'PRO-102',
                },
                healProposal: {
                  targetNodeId: node.id,
                  oldSelector: '.fa-layers-counter',
                  newSelector: '.shopping_cart_link',
                  confidence: 98,
                  explanation: 'Replaced removed FontAwesome badge with .shopping_cart_link.',
                },
              },
            ]);
            setIsCopilotOpen(true);
          } else if (sel === 'a:has-text("CHECKOUT")') {
            setCopilotMessages((prev) => [
              ...prev,
              {
                id: `copilot-pro-checkout-${Date.now()}`,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: '⚠️ **Trouble Root Cause in aato-test/pro:**\n\n- **File:** `Pages/CheckoutPage.py`\n- **Failing Locator:** `(By.LINK_TEXT, "CHECKOUT")`\n- **Cause:** SauceDemo Checkout is a `<button id="checkout">`, not an anchor `<a>` link.\n- **Recommended Fix:** Update selector to `button#checkout` or `[data-test="checkout"]` (97% confidence).',
                diagnostic: {
                  issueType: 'selector_instability',
                  targetSelector: 'a:has-text("CHECKOUT")',
                  confidence: 97,
                  reason: 'Target is a button element, not an anchor tag.',
                  oldSelector: 'a:has-text("CHECKOUT")',
                  newSelector: 'button#checkout',
                  diff: {
                    removed: 'a:has-text("CHECKOUT")',
                    added: 'button#checkout',
                  },
                  recommendation: 'Update locator to button#checkout',
                  affectedStepId: node.id,
                  affectedSuiteId: suiteId,
                  linkedJiraKey: 'PRO-103',
                },
                healProposal: {
                  targetNodeId: node.id,
                  oldSelector: 'a:has-text("CHECKOUT")',
                  newSelector: 'button#checkout',
                  confidence: 97,
                  explanation: 'Replaced anchor text with button#checkout locator.',
                },
              },
            ]);
            setIsCopilotOpen(true);
          } else if (sel === '//input[@value="CONTINUE"]') {
            setCopilotMessages((prev) => [
              ...prev,
              {
                id: `copilot-pro-continue-${Date.now()}`,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: '⚠️ **Trouble Root Cause in aato-test/pro:**\n\n- **File:** `Pages/CheckoutPage.py`\n- **Failing Locator:** `//input[@value=\'CONTINUE\']`\n- **Cause:** Case sensitivity mismatch. The DOM attribute is `value="Continue"`, not uppercase `CONTINUE`.\n- **Recommended Fix:** Update selector to `input[value="Continue"]` or `#continue` (99% confidence).',
                diagnostic: {
                  issueType: 'selector_instability',
                  targetSelector: '//input[@value="CONTINUE"]',
                  confidence: 99,
                  reason: 'Case mismatch on input button value attribute.',
                  oldSelector: '//input[@value="CONTINUE"]',
                  newSelector: '#continue',
                  diff: {
                    removed: '//input[@value="CONTINUE"]',
                    added: '#continue',
                  },
                  recommendation: 'Update locator to #continue',
                  affectedStepId: node.id,
                  affectedSuiteId: suiteId,
                  linkedJiraKey: 'PRO-104',
                },
                healProposal: {
                  targetNodeId: node.id,
                  oldSelector: '//input[@value="CONTINUE"]',
                  newSelector: '#continue',
                  confidence: 99,
                  explanation: 'Replaced case-sensitive uppercase XPath with reliable #continue ID.',
                },
              },
            ]);
            setIsCopilotOpen(true);
          } else if (sel === 'a:has-text("FINISH")') {
            setCopilotMessages((prev) => [
              ...prev,
              {
                id: `copilot-pro-finish-${Date.now()}`,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: '⚠️ **Trouble Root Cause in aato-test/pro:**\n\n- **File:** `Pages/CheckoutPage.py`\n- **Failing Locator:** `(By.LINK_TEXT, "FINISH")`\n- **Cause:** SauceDemo Finish is a `<button id="finish">`, not an anchor `<a>` link.\n- **Recommended Fix:** Update selector to `button#finish` or `#finish` (98% confidence).',
                diagnostic: {
                  issueType: 'selector_instability',
                  targetSelector: 'a:has-text("FINISH")',
                  confidence: 98,
                  reason: 'Target is a button element, not an anchor tag.',
                  oldSelector: 'a:has-text("FINISH")',
                  newSelector: '#finish',
                  diff: {
                    removed: 'a:has-text("FINISH")',
                    added: '#finish',
                  },
                  recommendation: 'Update locator to #finish',
                  affectedStepId: node.id,
                  affectedSuiteId: suiteId,
                  linkedJiraKey: 'PRO-105',
                },
                healProposal: {
                  targetNodeId: node.id,
                  oldSelector: 'a:has-text("FINISH")',
                  newSelector: '#finish',
                  confidence: 98,
                  explanation: 'Replaced anchor locator with button#finish ID.',
                },
              },
            ]);
            setIsCopilotOpen(true);
          }

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
    const browserName = `${engineDisplay} 124`;
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
      browser: browserName,
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

    logAudit(
      status === 'passed' ? 'Test Suite Passed' : 'Test Suite Failed',
      `${suite.name} on ${browserName} (${(durationMs / 1000).toFixed(2)}s)`,
      status === 'passed' ? 'passed' : 'failed'
    );

    // Update suite overall status
    setSuites((prev) =>
      prev.map((s) =>
        s.id === suiteId
          ? {
              ...s,
              targetBrowser: activeEngine,
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
      className="flex h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans antialiased"
    >
      {/* 1. Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        suites={repoSuites}
        currentSuiteId={currentSuiteId}
        onSelectSuite={setCurrentSuiteId}
        userName={userSession.name}
        userRole={userSession.role}
        onOpenUserSessionModal={() => setIsUserModalOpen(true)}
        onCreateNewSuite={() => setIsCreateModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 2. Top Navigation Bar */}
        <Topbar
          activeTab={activeTab}
          currentSuite={currentSuite}
          suites={repoSuites}
          testRuns={testRuns}
          isRunning={isRunning}
          onRunTest={() => handleRunTest()}
          onBrowserChange={handleBrowserChange}
          selectedBrowser={selectedBrowser}
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
          onOpenUploadGithub={() => setIsUploadGithubOpen(true)}
          onOpenUserSessionModal={() => setIsUserModalOpen(true)}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          workspaceName={userSession.workspaceName}
          onSelectWorkspace={(wsName) => {
            setUserSession((prev) => {
              const next = { ...prev, workspaceName: wsName };
              localStorage.setItem('playsight_user_session', JSON.stringify(next));
              return next;
            });
            logAudit('Switched Company Workspace', wsName, 'info');
            showNotification(`Switched to workspace: ${wsName}`);
          }}
          userName={userSession.name}
          userRole={userSession.role}
          isGoogleSignedIn={isGoogleSignedIn}
          userEmail={userSession.email}
        />

        {/* Global Prominent Toast Notification */}
        {notification && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ease-out transform animate-in fade-in slide-in-from-top-4">
            <div
              className={`pointer-events-auto flex items-center gap-3.5 px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-md ring-1 text-sm font-sans font-medium ${
                notification.type === 'success'
                  ? 'bg-slate-900/95 text-white border-slate-700/80 ring-black/20 shadow-green-700/10'
                  : notification.type === 'error'
                  ? 'bg-rose-950/95 text-white border-rose-800 ring-rose-500/20 shadow-rose-500/20'
                  : 'bg-amber-950/95 text-white border-amber-800 ring-amber-500/20 shadow-amber-500/20'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  notification.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : notification.type === 'error'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {notification.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-white">
                  {notification.message}
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </div>
          </div>
        )}

        {/* 3. Main Views Routing */}
        <main className="flex-1 overflow-hidden bg-slate-50 flex flex-col relative">
          {activeTab === 'overview' || activeTab === 'dashboard' ? (
            <DashboardCards
              suites={repoSuites}
              testRuns={testRuns}
              jiraIssues={jiraIssues}
              currentBranch={currentBranch}
              currentRepo={currentRepo}
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
              onNavigateToRepoPages={() => setActiveTab('repo-pages')}
              onOpenConnectJira={() => setIsJiraModalOpen(true)}
              isRunning={isRunning}
            />
          ) : activeTab === 'repo-pages' ? (
            <RepoPagesView
              currentRepo={currentRepo}
              currentBranch={currentBranch}
              onCreateSuiteFromPage={(page) => {
                const nodes: TestNode[] = [];
                const edges: ConnectionEdge[] = [];

                // Step 1: Navigate to page route
                const navId = 'step-1-nav';
                nodes.push({
                  id: navId,
                  type: 'navigate',
                  title: `Navigate to ${page.name}`,
                  position: { x: 80, y: 140 },
                  data: {
                    url: page.routeUrl.startsWith('http')
                      ? page.routeUrl
                      : `https://${currentRepo.split('/')[1] || 'app'}.com${page.routeUrl.startsWith('/') ? '' : '/'}${page.routeUrl}`,
                    timeout: 8000,
                    waitUntil: 'domcontentloaded',
                  },
                  status: 'idle',
                });

                let lastId = navId;
                let stepCounter = 2;
                let xPos = 430;

                const elements =
                  page.detectedElements && page.detectedElements.length > 0
                    ? page.detectedElements
                    : ['#search-field', 'button[type="submit"]', '.main-container'];

                elements.forEach((selector) => {
                  const s = selector.toLowerCase();
                  const stepId = `step-${stepCounter}`;

                  if (
                    s.includes('input') ||
                    s.includes('field') ||
                    s.includes('email') ||
                    s.includes('user') ||
                    s.includes('search') ||
                    s.includes('password') ||
                    s.includes('query')
                  ) {
                    nodes.push({
                      id: stepId,
                      type: 'input',
                      title: `Fill Input (${selector})`,
                      position: { x: xPos, y: 140 },
                      data: {
                        selector,
                        value: s.includes('password')
                          ? 'secret_sauce'
                          : s.includes('user')
                          ? 'standard_user'
                          : s.includes('first')
                          ? 'Rafael'
                          : s.includes('last')
                          ? 'Elias'
                          : s.includes('postal') || s.includes('zip')
                          ? '10001'
                          : s.includes('email')
                          ? 'qa-tester@company.internal'
                          : 'Sample Test Query',
                        clearFirst: true,
                        maskInput: s.includes('password'),
                        timeout: 5000,
                      },
                      status: 'idle',
                    });
                  } else if (
                    s.includes('btn') ||
                    s.includes('button') ||
                    s.includes('submit') ||
                    s.includes('cta') ||
                    s.includes('login') ||
                    s.includes('pay') ||
                    s.includes('click')
                  ) {
                    nodes.push({
                      id: stepId,
                      type: 'click',
                      title: `Click Button (${selector})`,
                      position: { x: xPos, y: 140 },
                      data: {
                        selector,
                        clickType: 'single',
                        waitForSelector: true,
                        timeout: 6000,
                      },
                      status: 'idle',
                    });
                  } else {
                    nodes.push({
                      id: stepId,
                      type: 'assert',
                      title: `Assert Visible (${selector})`,
                      position: { x: xPos, y: 140 },
                      data: {
                        selector,
                        assertionType: 'is_visible',
                        expectedValue: '',
                        timeout: 5000,
                      },
                      status: 'idle',
                    });
                  }

                  edges.push({
                    id: `e-${lastId}-${stepId}`,
                    sourceId: lastId,
                    targetId: stepId,
                  });

                  lastId = stepId;
                  stepCounter++;
                  xPos += 350;
                });

                // Final verification snapshot step
                const finalStepId = `step-${stepCounter}`;
                nodes.push({
                  id: finalStepId,
                  type: 'screenshot',
                  title: `Capture Page Snapshot`,
                  position: { x: xPos, y: 140 },
                  data: {
                    captureFullPage: true,
                    selector: '',
                    fileName: `${page.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_verified.png`,
                    timeout: 5000,
                  },
                  status: 'idle',
                });
                edges.push({
                  id: `e-${lastId}-${finalStepId}`,
                  sourceId: lastId,
                  targetId: finalStepId,
                });

                const newSuite: TestSuite = {
                  id: `suite-${Date.now()}`,
                  name: `${page.name} End-to-End Suite`,
                  description: `Complete journey test suite generated from ${page.filePath || page.routeUrl}`,
                  teamId: 'team-default',
                  baseUrl: page.routeUrl,
                  repositoryFullName: currentRepo,
                  branchName: currentBranch,
                  environment: currentEnvironment,
                  targetBrowser: selectedBrowser || 'chromium',
                  triggerType: 'push',
                  nodes,
                  edges,
                  status: 'passing',
                  updatedAt: 'Just now',
                };

                setSuites((prev) => [newSuite, ...prev]);
                setCurrentSuiteId(newSuite.id);
                setActiveTab('workflows');
                showNotification(`Generated visual test suite with ${nodes.length} steps for ${page.name}`);
              }}
              onNavigateToBuilder={() => setActiveTab('workflows')}
            />
          ) : activeTab === 'workflows' || activeTab === 'builder' ? (
            <VisualBuilder
              key={currentSuite?.id || `empty-${currentRepo}`}
              suite={currentSuite}
              currentRepo={currentRepo}
              onCreateNewSuite={() => setIsCreateModalOpen(true)}
              onUpdateSuite={handleUpdateCurrentSuite}
              isRunning={isRunning}
              onRunTest={() => handleRunTest()}
              onOpenJsonModal={() => setIsJsonModalOpen(true)}
              onOpenCopilot={() => setIsCopilotOpen(true)}
              onAutoHealTrigger={(nodeId) => {
                setIsCopilotOpen(true);
              }}
              onOpenUploadGithub={() => setIsUploadGithubOpen(true)}
            />
          ) : activeTab === 'test-runs' || activeTab === 'history' ? (
            <TestRunHistory
              runs={testRuns.filter((r) =>
                repoSuites.some((s) => s.id === r.suiteId || s.name === r.suiteName)
              )}
              currentBranch={currentBranch}
              onTriggerRun={() => handleRunTest()}
              isRunning={isRunning}
            />
          ) : activeTab === 'traceability' || activeTab === 'jira' ? (
            <JiraBoard
              issues={jiraIssues}
              suites={repoSuites}
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

          {/* Floating FAB: QA Copilot */}
          {!isCopilotOpen && (
            <button
              id="floating-qa-copilot-btn"
              aria-label="QA Copilot"
              onClick={() => setIsCopilotOpen(true)}
              className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-green-700 hover:bg-green-800 active:scale-95 text-white shadow-xl shadow-green-700/25 flex items-center justify-center transition-all cursor-pointer border border-indigo-400/30 group"
              title="QA Copilot · ⌘J"
            >
              <span className="relative flex items-center justify-center">
                <Sparkles className="w-5 h-5 fill-white" />
                {hasFailure && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 border border-white animate-pulse" />
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
        suites={repoSuites}
        onSelectSuite={setCurrentSuiteId}
      />

      {/* Create Workflow Modal (Section 26) */}
      <CreateWorkflowModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateWorkflow={handleCreateWorkflow}
        currentRepo={currentRepo}
        currentBranch={currentBranch}
      />

      {/* JSON Schema Exporter */}
      {currentSuite && (
        <JsonExportModal
          isOpen={isJsonModalOpen}
          onClose={() => setIsJsonModalOpen(false)}
          nodes={currentSuite.nodes}
          edges={currentSuite.edges}
          suiteName={currentSuite.name}
          browser={currentSuite.targetBrowser}
        />
      )}

      {/* Google Authentication & Imports Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        userEmail={userSession.email}
        userName={userSession.name}
        isSignedIn={isGoogleSignedIn}
        onAuthChange={(signedIn, user) => {
          setIsGoogleSignedIn(signedIn);
          setUserSession((prev) => ({
            ...prev,
            name: user.name || prev.name,
            email: user.email || prev.email,
          }));
        }}
        onImportTargets={handleImportGoogleTargets}
      />

      {/* GitHub Suite Uploader Modal */}
      {currentSuite && (
        <UploadToGithubModal
          isOpen={isUploadGithubOpen}
          onClose={() => setIsUploadGithubOpen(false)}
          suite={currentSuite}
          currentRepo={currentRepo}
          currentBranch={currentBranch}
          branches={branches}
          userEmail={userSession.email}
          userName={userSession.name}
          onSuccess={(details) => {
            logAudit('Pushed Test Suite to GitHub', `${currentSuite.name} -> ${details.branch}`, 'passed');
            showNotification(
              `Pushed "${currentSuite.name}" to GitHub ${details.branch} (${details.commitSha})!`,
              'success'
            );
          }}
        />
      )}

      {/* User Identity & Company Workspace Modal */}
      <UserSessionModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentSession={userSession}
        onUpdateSession={(newSession) => {
          setUserSession(newSession);
          localStorage.setItem('playsight_user_session', JSON.stringify(newSession));
          logAudit('Switched Company Workspace', newSession.workspaceName, 'info');
          showNotification(`Switched to workspace: ${newSession.workspaceName}`);
        }}
        auditLogs={auditLogs}
        onOpenLoginModal={() => {
          setIsUserModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* Multi-User Enterprise Login & Workspace Invite Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(newSession, wsName) => {
          setUserSession(newSession);
          localStorage.setItem('playsight_user_session', JSON.stringify(newSession));
          setIsGoogleSignedIn(newSession.email.includes('gmail'));
          logAudit('Signed In to Workspace', `${newSession.email} (${wsName || newSession.workspaceName})`, 'passed');
          showNotification(`Signed in as ${newSession.name} (${newSession.role})`, 'success');
        }}
      />

      {/* Connect Jira Instance Modal */}
      <ConnectJiraModal
        isOpen={isJiraModalOpen}
        onClose={() => setIsJiraModalOpen(false)}
        jiraStatus={jiraStatus}
        onConnectionSuccess={async () => {
          await refreshWorkspace();
          logAudit('Connected Jira Instance', jiraStatus?.siteName || 'Jira Cloud', 'passed');
          showNotification('Jira Cloud instance successfully hooked up!');
        }}
      />
    </div>
  );
}
