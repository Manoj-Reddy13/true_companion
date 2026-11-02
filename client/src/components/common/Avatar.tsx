import React from 'react';

interface AvatarProps {
  avatarId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isOnline?: boolean;
}

const AVATAR_COLORS: Record<string, { bg: string; fill: string; eye: string }> = {
  'avatar-1': { bg: '#EDE9FE', fill: '#8B5CF6', eye: '#5B21B6' }, // Lavender
  'avatar-2': { bg: '#DBEAFE', fill: '#3B82F6', eye: '#1D4ED8' }, // Blue
  'avatar-3': { bg: '#E0F2FE', fill: '#0284C7', eye: '#0369A1' }, // Sky
  'avatar-4': { bg: '#DCFCE7', fill: '#16A34A', eye: '#15803D' }, // Mint
  'avatar-5': { bg: '#FEF3C7', fill: '#D97706', eye: '#B45309' }, // Amber
  'avatar-6': { bg: '#FCE7F3', fill: '#DB2777', eye: '#BE185D' }, // Rose
  'avatar-7': { bg: '#F3E8FF', fill: '#9333EA', eye: '#7E22CE' }, // Purple
  'avatar-8': { bg: '#CCFBF1', fill: '#0D9488', eye: '#0F766E' }, // Teal
};

export const Avatar: React.FC<AvatarProps> = ({
  avatarId = 'avatar-1',
  size = 'md',
  className = '',
  isOnline,
}) => {
  const scheme = AVATAR_COLORS[avatarId] || AVATAR_COLORS['avatar-1'];

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-lg',
  }[size];

  return (
    <div className={`relative inline-block select-none ${className}`}>
      <div
        className={`${sizeClasses} rounded-full flex items-center justify-center transition-transform hover:scale-105 duration-200 border-2 border-white dark:border-companion-dark-border shadow-sm overflow-hidden`}
        style={{ backgroundColor: scheme.bg }}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          {/* Gentle, peaceful abstract character */}
          <circle cx="20" cy="17" r="10" fill={scheme.fill} opacity="0.85" />
          {/* Peaceful closed eyes / gentle expression */}
          <path
            d="M15 17C15.8 18.5 17.2 18.5 18 17"
            stroke={scheme.eye}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M22 17C22.8 18.5 24.2 18.5 25 17"
            stroke={scheme.eye}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          {/* Gentle smile */}
          <path
            d="M17.5 22C18.5 23.5 21.5 23.5 22.5 22"
            stroke={scheme.eye}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Soft body/shoulders */}
          <path
            d="M7 36C7 29.5 13 28 20 28C27 28 33 29.5 33 36"
            fill={scheme.fill}
            opacity="0.9"
          />
        </svg>
      </div>

      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-companion-dark-bg ${
            isOnline ? 'bg-emerald-500' : 'bg-zinc-400'
          } ${size === 'sm' ? 'w-2.5 h-2.5' : size === 'xl' ? 'w-4 h-4' : 'w-3 h-3'}`}
          title={isOnline ? 'Online now' : 'Offline'}
        />
      )}
    </div>
  );
};

export const AvatarPicker: React.FC<{
  selected: string;
  onSelect: (id: string) => void;
}> = ({ selected, onSelect }) => {
  const avatarIds = [
    'avatar-1',
    'avatar-2',
    'avatar-3',
    'avatar-4',
    'avatar-5',
    'avatar-6',
    'avatar-7',
    'avatar-8',
  ];

  return (
    <div className="flex flex-wrap gap-3 py-2">
      {avatarIds.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className={`p-1 rounded-full transition-all duration-150 ${
            selected === id
              ? 'ring-2 ring-companion-lavender-500 ring-offset-2 dark:ring-offset-companion-dark-card scale-110'
              : 'opacity-70 hover:opacity-100 hover:scale-105'
          }`}
        >
          <Avatar avatarId={id} size="md" />
        </button>
      ))}
    </div>
  );
};
