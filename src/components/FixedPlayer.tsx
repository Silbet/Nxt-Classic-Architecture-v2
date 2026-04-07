import { SkipBack, SkipForward, Play, Pause } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { resolveCoverUrl } from '../utils/coverImage';
import SeekBar from './SeekBar';

export default function FixedPlayer() {
  const { state, dispatch } = usePlayer();
  const currentTrack =
    state.currentIndex >= 0 ? state.queue[state.currentIndex] : null;

  const handleSeek = (time: number) => {
    dispatch({ type: 'SEEK', payload: time });
  };

  return (
    <header className="sticky top-0 z-50 bg-bg-secondary border-b border-border">
      {currentTrack ? (
        <div className="px-3 py-3 flex flex-col gap-2 max-w-4xl mx-auto">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={resolveCoverUrl(currentTrack.coverUrl)}
              alt={`${currentTrack.album} 커버`}
              className="w-12 h-12 rounded object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-primary truncate">
                {currentTrack.title}
              </p>
              <p className="text-xs text-text-secondary truncate">
                {currentTrack.artist} · {currentTrack.album}
              </p>
              <p className="text-xs text-text-muted truncate">
                {currentTrack.members.map((m) => m.name).join(', ')}
              </p>
            </div>
          </div>

          {/* Audio Error */}
          {state.audioError && (
            <p className="text-xs text-red-400 text-center">{state.audioError}</p>
          )}

          {/* SeekBar */}
          <SeekBar
            currentTime={state.currentTime}
            duration={state.duration}
            onSeek={handleSeek}
          />

          {/* Controls */}
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={() => dispatch({ type: 'PREV' })}
              className="text-text-secondary hover:text-text-primary transition-colors active:scale-90"
              aria-label="이전 곡"
            >
              <SkipBack size={28} fill="currentColor" />
            </button>
            <button
              onClick={() =>
                dispatch({ type: state.isPlaying ? 'PAUSE' : 'PLAY' })
              }
              className="w-14 h-14 flex items-center justify-center rounded-full bg-text-primary text-bg-primary hover:scale-105 active:scale-95 transition-transform shadow-lg"
              aria-label={state.isPlaying ? '일시정지' : '재생'}
            >
              {state.isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" style={{ marginLeft: '3px' }} />}
            </button>
            <button
              onClick={() => dispatch({ type: 'NEXT' })}
              className="text-text-secondary hover:text-text-primary transition-colors active:scale-90"
              aria-label="다음 곡"
            >
              <SkipForward size={28} fill="currentColor" />
            </button>
          </div>
        </div>
      ) : (
        /* Placeholder when no track selected */
        <div className="px-3 py-4 text-center text-text-muted max-w-4xl mx-auto">
          선택된 곡 없음
        </div>
      )}
    </header>
  );
}
