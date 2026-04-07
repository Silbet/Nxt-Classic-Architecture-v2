import React, {
  createContext,
  useContext,
  useReducer,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import type { PlayerState, PlayerAction } from '../types';
import { playerReducer, initialState } from './playerReducer';

interface PlayerContextValue {
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevIndexRef = useRef<number>(state.currentIndex);

  // Audio event handlers
  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      dispatch({ type: 'SET_TIME', payload: audio.currentTime });
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      dispatch({ type: 'SET_DURATION', payload: audio.duration });
    }
  }, []);

  const handleError = useCallback(() => {
    dispatch({ type: 'SET_AUDIO_ERROR', payload: '오디오 파일을 로드할 수 없습니다.' });
  }, []);

  const handleEnded = useCallback(() => {
    if (state.autoplay) {
      dispatch({ type: 'NEXT' });
      dispatch({ type: 'PLAY' });
    } else {
      dispatch({ type: 'PAUSE' });
    }
  }, [state.autoplay]);

  // Attach/detach audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [handleTimeUpdate, handleLoadedMetadata, handleEnded, handleError]);

  // When currentIndex changes, load and play the new track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const track = state.queue[state.currentIndex];
    if (!track) return;

    // Only reload if the index actually changed
    if (prevIndexRef.current !== state.currentIndex) {
      prevIndexRef.current = state.currentIndex;
      audio.src = track.audioUrl;
      audio.load();

      if (state.isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Browser may block autoplay; silently handle
          });
        }
      }
    }
  }, [state.currentIndex, state.queue, state.isPlaying]);

  // Handle play/pause toggling
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (state.isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Browser may block autoplay
        });
      }
    } else {
      audio.pause();
    }
  }, [state.isPlaying]);

  // Handle seek
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    // Only seek if the difference is significant (avoid feedback loop from timeupdate)
    if (Math.abs(audio.currentTime - state.currentTime) > 0.5) {
      audio.currentTime = state.currentTime;
    }
  }, [state.currentTime]);

  const contextValue: PlayerContextValue = { state, dispatch, audioRef };

  return (
    <PlayerContext.Provider value={contextValue}>
      <audio ref={audioRef} preload="metadata" />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
