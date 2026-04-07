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
                {currentTrack.members.map((m) => `${m.name}(${m.part})`).join(', ')}
                {' · '}
                {currentTrack.recordedAt}
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
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => dispatch({ type: 'PREV' })}
              className="text-xl text-text-secondary hover:text-text-primary transition-colors"
              aria-label="이전 곡"
            >
              ⏮
            </button>
            <button
              onClick={() =>
                dispatch({ type: state.isPlaying ? 'PAUSE' : 'PLAY' })
              }
              className="w-10 h-10 flex items-center justify-center rounded-full bg-text-primary text-bg-primary text-lg hover:scale-105 transition-transform"
              aria-label={state.isPlaying ? '일시정지' : '재생'}
            >
              {state.isPlaying ? '⏸' : '▶'}
            </button>
            <button
              onClick={() => dispatch({ type: 'NEXT' })}
              className="text-xl text-text-secondary hover:text-text-primary transition-colors"
              aria-label="다음 곡"
            >
              ⏭
            </button>
          </div>
        </div>
      ) : (
        /* Placeholder when no track selected */
        <div className="px-3 py-4 text-center text-text-muted max-w-4xl mx-auto">
          곡을 선택해주세요
        </div>
      )}
    </header>
  );
}
