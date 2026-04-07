import { useState, useEffect } from 'react';
import type { Track } from '../types';
import { resolveCoverUrl } from '../utils/coverImage';

interface TrackItemProps {
  track: Track;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}

function formatDuration(seconds: number): string {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function useAudioDuration(audioUrl: string, dbDuration: number): number {
  const [duration, setDuration] = useState(dbDuration);

  useEffect(() => {
    if (dbDuration > 0) return; // DB에 값 있으면 그냥 사용
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.src = audioUrl;
    return () => { audio.src = ''; };
  }, [audioUrl, dbDuration]);

  return duration;
}

export default function TrackItem({ track, isActive, onSelect }: TrackItemProps) {
  const [expanded, setExpanded] = useState(false);
  const duration = useAudioDuration(track.audioUrl, track.duration);

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
          aria-label={`${track.title} 재생`}
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

        {/* Expand/collapse area */}
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="flex-1 min-w-0 text-left"
          aria-expanded={expanded}
          aria-label={`${track.title} 상세정보 ${expanded ? '접기' : '펼치기'}`}
        >
          <p className="text-sm font-medium text-text-primary truncate">
            {track.title}
          </p>
          <p className="text-xs text-text-secondary truncate">
            {track.artist} · {track.album}
          </p>
        </button>

        {/* Duration */}
        <span className="text-xs text-text-muted tabular-nums flex-shrink-0">
          {formatDuration(duration)}
        </span>
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
