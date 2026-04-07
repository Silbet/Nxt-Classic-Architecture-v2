import type { PlayerState, PlayerAction, Track } from '../types';

export const initialState: PlayerState = {
  tracks: [],
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  autoplay: true,
  sortOrder: 'desc',
  currentTime: 0,
  duration: 0,
  isLoading: false,
  error: null,
  audioError: null,
};

export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function sortTracks(tracks: Track[], order: 'desc' | 'asc'): Track[] {
  return [...tracks].sort((a, b) => {
    const recordedDiff = new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime();
    if (recordedDiff !== 0) return order === 'desc' ? -recordedDiff : recordedDiff;
    const uploadedDiff = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
    return order === 'desc' ? -uploadedDiff : uploadedDiff;
  });
}

function findTrackIndexInQueue(queue: Track[], track: Track | undefined): number {
  if (!track) return -1;
  return queue.findIndex((t) => t.id === track.id);
}

export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'LOAD_TRACKS': {
      const tracks = action.payload;
      const queue = sortTracks(tracks, state.sortOrder);
      return { ...state, tracks, queue, isLoading: false, error: null };
    }

    case 'SELECT_TRACK': {
      return {
        ...state,
        currentIndex: action.payload,
        isPlaying: true,
        currentTime: 0,
        audioError: null,
      };
    }

    case 'PLAY':
      return { ...state, isPlaying: true };

    case 'PAUSE':
      return { ...state, isPlaying: false };

    case 'NEXT': {
      if (state.queue.length === 0) return state;
      const nextIndex = (state.currentIndex + 1) % state.queue.length;
      return { ...state, currentIndex: nextIndex, currentTime: 0 };
    }

    case 'PREV': {
      if (state.queue.length === 0) return state;
      const prevIndex =
        state.currentIndex <= 0
          ? state.queue.length - 1
          : state.currentIndex - 1;
      return { ...state, currentIndex: prevIndex, currentTime: 0 };
    }

    case 'SEEK':
      return { ...state, currentTime: action.payload };

    case 'TOGGLE_SORT': {
      const newOrder = state.sortOrder === 'desc' ? 'asc' : 'desc';
      const currentTrack =
        state.currentIndex >= 0 ? state.queue[state.currentIndex] : undefined;

      const sorted = sortTracks(state.tracks, newOrder);
      const newIndex = findTrackIndexInQueue(sorted, currentTrack);
      return { ...state, sortOrder: newOrder, queue: sorted, currentIndex: newIndex };
    }

    case 'SET_TIME':
      return { ...state, currentTime: action.payload };

    case 'SET_DURATION':
      return { ...state, duration: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_AUDIO_ERROR':
      return { ...state, audioError: action.payload, isPlaying: false };

    default:
      return state;
  }
}
