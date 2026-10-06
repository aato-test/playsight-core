import React from 'react';

interface UserAvatarProps {
  name: string;
  role?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const USER_PROFILES: Record<string, { bg: string; text: string; border: string; initials: string }> = {
  'Prakash S.': {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-300',
    initials: 'PS',
  },
  'Sarah J.': {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    initials: 'SJ',
  },
  'Daniel J.': {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
    initials: 'DJ',
  },
  'Mike T.': {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    initials: 'MT',
  },
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 'sm',
  className = '',
}) => {
  const profile = USER_PROFILES[name] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
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
      className={`rounded-xl shrink-0 flex items-center justify-center font-sans font-bold select-none border transition-colors shadow-2xs ${profile.bg} ${profile.text} ${profile.border} ${sizeClasses} ${className}`}
    >
      {profile.initials}
    </div>
  );
};
