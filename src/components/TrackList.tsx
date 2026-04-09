import { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import TrackItem from './TrackItem';

export default function TrackList() {
  const { state, dispatch } = usePlayer();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(state.currentIndex);

  useEffect(() => {
    setExpandedIndex(state.currentIndex);
  }, [state.currentIndex]);

  const handleToggleExpand = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  if (state.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" role="status">
          <span className="sr-only">로딩 중...</span>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="px-4 py-8 text-center text-red-400" role="alert">
        {state.error}
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-3 py-4">
      {/* Sort toggle */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-secondary">
          곡 목록
        </h2>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SORT' })}
          className="text-xs px-3 py-1 rounded-full border border-border text-text-secondary hover:text-text-primary hover:border-text-muted transition-colors"
          aria-label={`정렬: ${state.sortOrder === 'desc' ? '최신순' : '오래된순'}`}
        >
          {state.sortOrder === 'desc' ? '최신순' : '오래된순'}
        </button>
      </div>

      {/* Track list */}
      {state.queue.length === 0 ? (
        <p className="text-center text-text-muted py-8">등록된 곡이 없습니다</p>
      ) : (
        <ul className="space-y-1">
          {state.queue.map((track, idx) => (
            <TrackItem
              key={track.id}
              track={track}
              index={idx}
              isActive={idx === state.currentIndex}
              expanded={expandedIndex === idx}
              onSelect={() => dispatch({ type: 'SELECT_TRACK', payload: idx })}
              onToggleExpand={() => handleToggleExpand(idx)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
