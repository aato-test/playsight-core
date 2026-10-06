import React from 'react';

export type BrowserEngine = 'chromium' | 'firefox' | 'webkit';

interface BrowserSelectorProps {
  currentBrowser: BrowserEngine;
  onBrowserChange: (browser: BrowserEngine) => void;
  className?: string;
  showLabels?: boolean;
}

export const ChromiumIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    {/* Blue Center Core */}
    <circle cx="12" cy="12" r="4.2" fill="#1A73E8" />
    <circle cx="12" cy="12" r="5" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
    {/* Top Red Segment */}
    <path
      d="M12 2C16.4 2 20.1 4.9 21.4 8.9L12 8.9C10.5 8.9 9.3 9.7 8.6 10.9L4.6 3.9C6.7 2.7 9.2 2 12 2Z"
      fill="#EA4335"
    />
    {/* Right Yellow Segment */}
    <path
      d="M21.4 8.9C21.8 9.9 22 10.9 22 12C22 16.5 19.1 20.3 15.1 21.6L10.4 13.5C10.9 12.6 11.9 12 13 12L21.4 8.9Z"
      fill="#FBBC04"
    />
    {/* Bottom Left Green Segment */}
    <path
      d="M15.1 21.6C14.1 21.9 13.1 22 12 22C7.6 22 3.8 19.1 2.5 15.1L7.2 7C6.7 7.9 6.7 9 7.1 9.9L11.8 18.1C12.8 19.8 14.5 21 15.1 21.6Z"
      fill="#34A853"
    />
  </svg>
);

export const FirefoxIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    {/* Globe base */}
    <circle cx="12" cy="12" r="9" fill="#2B3A8F" />
    <circle cx="12.5" cy="12.5" r="7.5" fill="#4C2C92" opacity="0.8" />
    {/* Curving fox flames */}
    <path
      d="M12 3C8 3 4.5 5.5 3 9.5C3.8 8.8 4.8 8.4 6 8.5C5.2 9.5 4.8 10.8 5 12.2C5.5 10.8 6.8 9.8 8.2 9.8C7.5 11 7.5 12.5 8 13.8C8.8 11.8 10.8 10.5 13 10.5C12 11.8 11.8 13.5 12.5 15C13.5 12.8 16 11.5 18.5 12C20 12.3 21.2 13.3 21.8 14.8C22 13.9 22 13 22 12C22 6.5 17.5 3 12 3Z"
      fill="#FF7139"
    />
    <path
      d="M21.5 14C20.5 18 16.5 21 12 21C8 21 4.5 18.5 3.5 15C5 17 7.5 18 10 18C8.5 17 7.5 15.5 7.5 13.8C8.5 15 10 15.8 11.8 15.8C10.5 14.8 10 13.2 10.5 11.8C11.8 13.5 14 14.5 16.2 14.5C15 13.5 14.8 12 15.5 10.8C17.5 12 19.5 14 21.5 14Z"
      fill="#FF3B30"
    />
    <path
      d="M14 6C13 7 12 8.5 12 10C13 9 14.5 8.5 16 9C15 8 14.5 7 14 6Z"
      fill="#FFE600"
    />
  </svg>
);

export const WebKitIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    {/* Safari / WebKit Blue Dial */}
    <circle cx="12" cy="12" r="10" fill="#0A84FF" />
    <circle cx="12" cy="12" r="9.2" stroke="#FFFFFF" strokeWidth="0.8" fill="none" opacity="0.9" />
    {/* Compass degree ticks */}
    <line x1="12" y1="3.2" x2="12" y2="4.8" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
    <line x1="12" y1="19.2" x2="12" y2="20.8" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
    <line x1="3.2" y1="12" x2="4.8" y2="12" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
    <line x1="19.2" y1="12" x2="20.8" y2="12" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
    {/* Compass Needle: Red pointing Top-Right */}
    <polygon points="12,12 11,11 17.5,6.5 13,13" fill="#FF3B30" />
    {/* Compass Needle: White pointing Bottom-Left */}
    <polygon points="12,12 13,13 6.5,17.5 11,11" fill="#FFFFFF" />
    {/* Center Pivot Point */}
    <circle cx="12" cy="12" r="1.3" fill="#FFFFFF" />
    <circle cx="12" cy="12" r="0.6" fill="#1C1C1E" />
  </svg>
);

const BROWSERS: { id: BrowserEngine; name: string; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'chromium', name: 'Chromium', label: 'Chrome / Edge', icon: ChromiumIcon },
  { id: 'firefox', name: 'Firefox', label: 'Gecko', icon: FirefoxIcon },
  { id: 'webkit', name: 'WebKit', label: 'Safari', icon: WebKitIcon },
];

export const BrowserSelector: React.FC<BrowserSelectorProps> = ({
  currentBrowser,
  onBrowserChange,
  className = '',
  showLabels = true,
}) => {
  return (
    <div
      className={`inline-flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 shadow-2xs ${className}`}
      role="group"
      aria-label="Browser Engine Selector"
    >
      {BROWSERS.map((b) => {
        const Icon = b.icon;
        const isSelected = currentBrowser === b.id;
        return (
          <button
            key={b.id}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBrowserChange(b.id);
            }}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
              isSelected
                ? 'bg-white text-slate-900 shadow-sm border border-indigo-300 ring-2 ring-indigo-500/25 scale-[1.02]'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
            }`}
            title={`Switch to ${b.name} (${b.label})`}
          >
            <Icon className="w-5.5 h-5.5 shrink-0 transition-transform hover:scale-110 drop-shadow-xs" />
            {showLabels && (
              <span className="font-sans font-bold tracking-tight text-xs flex items-center gap-1.5">
                <span>{b.name}</span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
