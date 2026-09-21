import type { ClubCode } from '@/types/api';

type ClubLike = {
  code?: ClubCode | string;
  name?: string;
  logoUrl?: string;
};

const sizeClasses = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
} as const;

const initialsFor = (club: ClubLike) => {
  const label = club.code || club.name || 'Club';
  return label
    .split(/[-\s]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};

export function ClubLogo({ club, size = 'md' }: { club: ClubLike; size?: keyof typeof sizeClasses }) {
  const initials = initialsFor(club);

  return club.logoUrl ? (
    <img
      src={club.logoUrl}
      alt={`${club.name ?? club.code ?? 'Club'} logo`}
      className={`${sizeClasses[size]} shrink-0 rounded-full border border-white/10 object-cover`}
    />
  ) : (
    <span
      aria-label={`${club.name ?? club.code ?? 'Club'} logo`}
      className={`${sizeClasses[size]} flex shrink-0 items-center justify-center rounded-full border border-brand-400/30 bg-brand-500/15 font-bold text-brand-300`}
    >
      {initials}
    </span>
  );
}