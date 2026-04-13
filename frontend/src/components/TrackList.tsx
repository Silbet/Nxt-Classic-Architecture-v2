import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import TrackItem from './TrackItem';
import UploadModal from './UploadModal';
import { fetchTracks, deleteTrack } from '../lib/api';

export default function TrackList() {
  const { state, dispatch } = usePlayer();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(state.currentIndex);
  const [showUpload, setShowUpload] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleUploadSuccess = async () => {
    setShowUpload(false);
    try {
      const tracks = await fetchTracks();
      dispatch({ type: 'LOAD_TRACKS', payload: tracks });
    } catch {
      // 실패해도 모달은 닫힘
    }
  };

  const handleDelete = async (trackId: string, trackTitle: string) => {
    if (!confirm(`"${trackTitle}"을(를) 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`)) return;
    try {
      await deleteTrack(trackId);
      const tracks = await fetchTracks();
      dispatch({ type: 'LOAD_TRACKS', payload: tracks });
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditMode((v) => !v)}
            className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full border transition-colors ${
              editMode
                ? 'bg-red-500 border-red-500 text-white hover:opacity-90'
                : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
            }`}
            aria-label="곡 삭제 모드"
          >
            <Trash2 size={12} /> 곡 삭제
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-accent text-white hover:opacity-90 transition-opacity"
            aria-label="곡 추가"
          >
            <Plus size={12} /> 곡 추가
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SORT' })}
            className="text-xs px-3 py-1 rounded-full border border-border text-text-secondary hover:text-text-primary hover:border-text-muted transition-colors"
            aria-label={`정렬: ${state.sortOrder === 'desc' ? '최신순' : '오래된순'}`}
          >
            {state.sortOrder === 'desc' ? '최신순' : '오래된순'}
          </button>
        </div>
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
              editMode={editMode}
              onSelect={() => dispatch({ type: 'SELECT_TRACK', payload: idx })}
              onToggleExpand={() => handleToggleExpand(idx)}
              onDelete={() => handleDelete(track.id, track.title)}
            />
          ))}
        </ul>
      )}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </section>
  );
}
