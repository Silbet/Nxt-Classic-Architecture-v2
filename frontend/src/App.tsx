import { useEffect, useState } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import FixedPlayer from './components/FixedPlayer';
import TrackList from './components/TrackList';
import { fetchTracks } from './lib/api';

function AppContent() {
  const { dispatch } = usePlayer();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadTracks() {
      setIsLoading(true);
      try {
        const tracks = await fetchTracks();
        if (!cancelled) {
          dispatch({ type: 'LOAD_TRACKS', payload: tracks });
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : '트랙 목록을 불러올 수 없습니다.';
          dispatch({ type: 'SET_ERROR', payload: message });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadTracks();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div
          className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin"
          role="status"
        >
          <span className="sr-only">로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <FixedPlayer />
      <main>
        <TrackList />
      </main>
    </>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <div className="min-h-screen bg-bg-primary text-text-primary">
        <AppContent />
      </div>
    </PlayerProvider>
  );
}
