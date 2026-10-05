import React from 'react';

interface UserAvatarProps {
  name: string;
  role?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

// Domain-tinted deterministic avatar palette (Section 32)
const USER_PROFILES: Record<string, { bg: string; text: string; border: string; initials: string }> = {
  'Prakash S.': {
    bg: 'bg-teal-500/15',
    text: 'text-teal-300',
    border: 'border-teal-500/35',
    initials: 'PS',
  },
  'Sarah J.': {
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-300',
    border: 'border-cyan-500/35',
    initials: 'SJ',
  },
  'Daniel J.': {
    bg: 'bg-blue-500/15',
    text: 'text-blue-300',
    border: 'border-blue-500/35',
    initials: 'DJ',
  },
  'Mike T.': {
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/35',
    initials: 'MT',
  },
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 'sm',
  className = '',
}) => {
  const profile = USER_PROFILES[name] || {
    bg: 'bg-slate-800',
    text: 'text-slate-200',
    border: 'border-slate-700',
    initials: name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase(),
  };

  const sizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-9 h-9 text-sm',
  }[size];

  return (
    <div
      title={name}
      className={`rounded-md shrink-0 flex items-center justify-center font-mono font-semibold select-none border transition-colors ${profile.bg} ${profile.text} ${profile.border} ${sizeClasses} ${className}`}
    >
      {profile.initials}
    </div>
  );
};
