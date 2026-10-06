import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  GitBranch,
  Play,
  RotateCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileCode,
  Folder,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Search,
} from 'lucide-react';
import { DetectedPage, RepoFileNode } from '../types';

interface RepoPagesViewProps {
  currentRepo: string;
  currentBranch: string;
  onCreateSuiteFromPage?: (page: DetectedPage) => void;
  onNavigateToBuilder?: () => void;
}

export const RepoPagesView: React.FC<RepoPagesViewProps> = ({
  currentRepo,
  currentBranch,
  onCreateSuiteFromPage,
  onNavigateToBuilder,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pages' | 'explorer'>('pages');
  const [pages, setPages] = useState<DetectedPage[]>([]);
  const [files, setFiles] = useState<RepoFileNode[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<{ path: string; name: string; content: string } | null>(null);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [testingPageId, setTestingPageId] = useState<string | null>(null);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Fetch detected pages
  const loadPages = async () => {
    setIsLoadingPages(true);
    try {
      const res = await fetch(`/api/integrations/github/repositories/${encodeURIComponent(currentRepo)}/pages`);
      if (res.ok) {
        const data = await res.json();
        setPages(data);
      }
    } catch (err) {
      console.warn('Failed to load repo pages:', err);
    } finally {
      setIsLoadingPages(false);
    }
  };

  // Fetch files in folder
  const loadFiles = async (path: string = '') => {
    setIsLoadingFiles(true);
    try {
      const res = await fetch(
        `/api/integrations/github/repositories/${encodeURIComponent(currentRepo)}/contents?path=${encodeURIComponent(path)}`
      );
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
        setCurrentPath(path);
      }
    } catch (err) {
      console.warn('Failed to load repo files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // View file content
  const viewFile = async (filePath: string, fileName: string) => {
    try {
      const res = await fetch(
        `/api/integrations/github/repositories/${encodeURIComponent(currentRepo)}/file?path=${encodeURIComponent(filePath)}`
      );
      if (res.ok) {
        const data = await res.json();
        setSelectedFile({
          path: filePath,
          name: fileName,
          content: data.content || '// Empty file or binary asset',
        });
        setActiveSubTab('explorer');
      }
    } catch (err) {
      console.warn('Failed to fetch file content:', err);
    }
  };

  useEffect(() => {
    loadPages();
    loadFiles('');
    setSelectedFile(null);
  }, [currentRepo]);

  // Test an individual page
  const handleTestPage = async (pageId: string) => {
    setTestingPageId(pageId);
    try {
      const res = await fetch(
        `/api/integrations/github/repositories/${encodeURIComponent(currentRepo)}/pages/${encodeURIComponent(pageId)}/test`,
        { method: 'POST' }
      );
      if (res.ok) {
        const updatedPage: DetectedPage = await res.json();
        setPages((prev) => prev.map((p) => (p.id === pageId ? updatedPage : p)));
      }
    } catch (err) {
      console.warn('Page test failed:', err);
    } finally {
      setTestingPageId(null);
    }
  };

  // Test all pages in sequence
  const handleTestAllPages = async () => {
    setIsTestingAll(true);
    try {
      const res = await fetch(
        `/api/integrations/github/repositories/${encodeURIComponent(currentRepo)}/pages/test-all`,
        { method: 'POST' }
      );
      if (res.ok) {
        const updatedPages: DetectedPage[] = await res.json();
        setPages(updatedPages);
      }
    } catch (err) {
      console.warn('Failed testing all pages:', err);
    } finally {
      setIsTestingAll(false);
    }
  };

  const handleCopyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredPages = pages.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.filePath.toLowerCase().includes(q) ||
      p.routeUrl.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  const passedCount = pages.filter((p) => p.status === 'passed').length;
  const failedCount = pages.filter((p) => p.status === 'failed').length;
  const untestedCount = pages.filter((p) => p.status === 'not_tested').length;

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <FolderGit2 className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Repository Content & Page Explorer
            </h1>
          </div>
          <p className="text-sm md:text-base text-slate-600 mt-1.5 font-medium leading-relaxed">
            Live file inspection and automated entry-point detection for{' '}
            <span className="font-bold text-slate-900">{currentRepo}</span> on branch{' '}
            <span className="font-bold text-indigo-700">{currentBranch}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              loadPages();
              loadFiles(currentPath);
            }}
            disabled={isLoadingPages || isLoadingFiles}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-sm font-bold text-slate-700 transition-colors cursor-pointer"
            title="Reload repository files from GitHub"
          >
            <RotateCw className={`w-4 h-4 ${isLoadingPages || isLoadingFiles ? 'animate-spin' : ''}`} />
            <span>Sync GitHub</span>
          </button>

          <button
            onClick={handleTestAllPages}
            disabled={isTestingAll || pages.length === 0}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-bold transition-all shadow-md cursor-pointer active:scale-98 disabled:opacity-50"
          >
            {isTestingAll ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Testing Pages...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Test All Pages ({pages.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Detected Pages
          </div>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {pages.length}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Testable entry points
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Passed</span>
          </div>
          <div className="text-3xl font-black text-emerald-700 mt-1">
            {passedCount}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Pages verified healthy
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Failed</span>
          </div>
          <div className="text-3xl font-black text-rose-700 mt-1">
            {failedCount}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Require attention
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Not Tested</span>
          </div>
          <div className="text-3xl font-black text-slate-600 mt-1">
            {untestedCount}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Awaiting individual check
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Discovered Pages vs File Explorer */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSubTab('pages')}
            className={`px-4.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'pages'
                ? 'bg-green-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>Starting Points & Pages ({pages.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('explorer')}
            className={`px-4.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'explorer'
                ? 'bg-green-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>Repository File Tree & Code</span>
          </button>
        </div>

        {activeSubTab === 'pages' && (
          <div className="relative w-72 hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search pages or routes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-100 border border-slate-300 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-indigo-500 focus:bg-white transition-all"
            />
          </div>
        )}
      </div>

      {/* View 1: Discovered Pages & Entry Points */}
      {activeSubTab === 'pages' && (
        <div className="space-y-5">
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4.5 text-sm text-indigo-950 flex items-start gap-3 shadow-xs">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Automated Entry-Point Detection: </span>
              These starting points and page objects were identified by parsing the repository files on GitHub.
              Click <span className="font-bold text-indigo-800">Test Page</span> to verify functional response, DOM availability, and locator health individually.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPages.map((page) => {
              const isTesting = testingPageId === page.id;
              const isPassed = page.status === 'passed';
              const isFailed = page.status === 'failed';

              return (
                <div
                  key={page.id}
                  className={`rounded-2xl border-2 bg-white p-5.5 space-y-4 shadow-sm transition-all hover:shadow-md ${
                    isPassed
                      ? 'border-emerald-300 ring-1 ring-emerald-200'
                      : isFailed
                      ? 'border-rose-300 ring-1 ring-rose-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Page Title & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-slate-900">{page.name}</span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase tracking-wider">
                          {page.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div
                        onClick={() => viewFile(page.filePath, page.filePath.split('/').pop() || page.name)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-mono mt-1 flex items-center gap-1.5 cursor-pointer font-bold underline underline-offset-2"
                        title="Click to view file in explorer"
                      >
                        <FileCode className="w-4 h-4" />
                        <span>{page.filePath}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isPassed && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-2xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>PASSED ({page.latencyMs}ms)</span>
                        </span>
                      )}
                      {isFailed && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold shadow-2xs">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>FAILED</span>
                        </span>
                      )}
                      {!isPassed && !isFailed && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold">
                          <HelpCircle className="w-4 h-4 text-slate-400" />
                          <span>NOT TESTED</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Route URL / Starting URL */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                    <div className="truncate font-mono text-xs text-slate-800 font-bold">
                      <span className="text-slate-400 font-medium">Route: </span>
                      <span>{page.routeUrl}</span>
                    </div>
                    {page.routeUrl.startsWith('http') && (
                      <a
                        href={page.routeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-indigo-600 shrink-0 ml-2"
                        title="Open route in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 font-normal leading-relaxed">
                    {page.description}
                  </p>

                  {/* Detected Selectors / Elements */}
                  {page.detectedElements && page.detectedElements.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Discovered Elements & Selectors ({page.detectedElements.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {page.detectedElements.map((el, i) => (
                          <span
                            key={i}
                            className="font-mono text-xs font-semibold bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-md text-slate-800"
                          >
                            {el}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error message if failed */}
                  {page.errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
                      <span className="font-bold">Error: </span> {page.errorMessage}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleTestPage(page.id)}
                      disabled={isTesting}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                        isTesting
                          ? 'bg-amber-500 text-white cursor-wait'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                      }`}
                    >
                      {isTesting ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" />
                          <span>Testing Page...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Test Page</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewFile(page.filePath, page.filePath.split('/').pop() || page.name)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-sm font-bold text-slate-700 transition-colors cursor-pointer"
                        title="Inspect page source code"
                      >
                        <FileCode className="w-4 h-4 text-slate-500" />
                        <span>Source</span>
                      </button>

                      <button
                        onClick={() => {
                          onCreateSuiteFromPage?.(page);
                          onNavigateToBuilder?.();
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-sm font-bold text-indigo-700 transition-colors cursor-pointer"
                        title="Create a PlaySight test workflow starting from this page"
                      >
                        <ArrowRight className="w-4 h-4 text-indigo-600" />
                        <span>Build Suite</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 2: File Tree & Content Viewer */}
      {activeSubTab === 'explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Tree Left Column */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-600" />
                <span>Files in {currentPath || '/ (root)'}</span>
              </div>
              {currentPath && (
                <button
                  onClick={() => {
                    const parts = currentPath.split('/');
                    parts.pop();
                    loadFiles(parts.join('/'));
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                >
                  ↑ Parent folder
                </button>
              )}
            </div>

            <div className="p-2 divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {files.map((file) => {
                const isDir = file.type === 'dir';

                return (
                  <button
                    key={file.path}
                    onClick={() => {
                      if (isDir) {
                        loadFiles(file.path);
                      } else {
                        viewFile(file.path, file.name);
                      }
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                      selectedFile?.path === file.path ? 'bg-indigo-50/80 text-indigo-900 font-bold' : 'text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {isDir ? (
                        <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <FileCode className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                      <span className="text-xs truncate">{file.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {file.size && file.size > 0 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      )}
                      {isDir && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer Right Column */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs flex flex-col">
            <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <FileCode className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-bold text-slate-800 truncate">
                  {selectedFile ? selectedFile.path : 'Select a file to inspect its source code'}
                </span>
              </div>

              {selectedFile && (
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                  title="Copy code to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-auto max-h-[500px] flex-1 leading-relaxed">
              {selectedFile ? (
                <pre className="whitespace-pre">{selectedFile.content}</pre>
              ) : (
                <div className="py-24 text-center text-slate-500">
                  <FileCode className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No file selected</p>
                  <p className="text-[11px] mt-1 text-slate-600">
                    Click any file on the left tree to inspect its contents directly from GitHub.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
