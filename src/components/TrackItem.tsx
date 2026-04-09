import type { Track } from '../types';
import { resolveCoverUrl } from '../utils/coverImage';

interface TrackItemProps {
  track: Track;
  index: number;
  isActive: boolean;
  expanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}

export default function TrackItem({ track, isActive, expanded, onSelect, onToggleExpand }: TrackItemProps) {

  return (
    <li
      className={`rounded-lg transition-colors ${
        isActive ? 'bg-bg-tertiary' : 'bg-bg-secondary hover:bg-bg-hover'
      }`}
    >
      <div className="flex items-center gap-3 px-3 py-2">
        {/* Play button area */}
        <button
          onClick={onSelect}
          className="flex-shrink-0 w-10 h-10 relative group"
          aria-label={`${track.title} 커버 이미지`}
        >
          <img
            src={resolveCoverUrl(track.coverUrl)}
            alt={`${track.album} 커버`}
            className="w-10 h-10 rounded object-cover"
          />
          <span
            className={`absolute inset-0 flex items-center justify-center rounded bg-black/50 text-sm transition-opacity ${
              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {isActive ? '♫' : '▶'}
          </span>
        </button>

        {/* Track info - click to select */}
        <button
          onClick={onSelect}
          className="flex-1 min-w-0 text-left"
          aria-label={`${track.title} 재생`}
        >
          <p className="text-sm font-medium text-text-primary truncate">
            {track.title}
          </p>
          <p className="text-xs text-text-secondary truncate">
            {track.artist} · {track.album}
          </p>
        </button>

        {/* Expand/collapse triangle */}
        <button
          onClick={onToggleExpand}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-text-primary hover:bg-bg-hover active:bg-bg-tertiary transition-colors"
          aria-expanded={expanded}
          aria-label={`${track.title} 상세정보 ${expanded ? '접기' : '펼치기'}`}
        >
          <svg
            width="16"
            height="10"
            viewBox="0 0 16 10"
            fill="currentColor"
            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          >
            <polygon points="8,0 16,10 0,10" />
          </svg>
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 pl-16 space-y-1">
          {Object.entries(
            track.members.reduce<Record<string, string[]>>((acc, m) => {
              (acc[m.part] ??= []).push(m.name);
              return acc;
            }, {})
          ).map(([part, names]) => (
            <p key={part} className="text-xs text-text-secondary">
              <span className="text-text-muted">{part}: </span>
              {names.join(', ')}
            </p>
          ))}
        </div>
      )}
    </li>
  );
}
