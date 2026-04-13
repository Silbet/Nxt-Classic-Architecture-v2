// --- Data Interfaces ---

export interface Member {
  name: string;
  part: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;        // seconds (0 if not set, will be read from audio file)
  recordedAt: string;      // ISO date string
  uploadedAt: string;      // ISO timestamp string
  audioUrl: string;
  coverUrl: string | null;
  members: Member[];
  playCount: number;
}

// --- Player State & Actions ---

export interface PlayerState {
  tracks: Track[];
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  autoplay: boolean;
  sortOrder: 'desc' | 'asc';
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
  audioError: string | null;
}

export type PlayerAction =
  | { type: 'LOAD_TRACKS'; payload: Track[] }
  | { type: 'SELECT_TRACK'; payload: number }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'SEEK'; payload: number }
  | { type: 'TOGGLE_SORT' }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_AUDIO_ERROR'; payload: string }
  | { type: 'INCREMENT_PLAY_COUNT'; payload: string };

