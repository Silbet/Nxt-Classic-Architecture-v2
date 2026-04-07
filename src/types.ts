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
  | { type: 'SET_AUDIO_ERROR'; payload: string };

// --- Supabase DB Response Type ---

export interface SupabaseTrackRow {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  recorded_at: string;
  uploaded_at: string;
  audio_url: string;
  cover_url: string | null;
  members: Member[];
}

// --- Mapping Function ---

export function mapSupabaseTrack(row: SupabaseTrackRow): Track {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    album: row.album,
    duration: row.duration,
    recordedAt: row.recorded_at,
    uploadedAt: row.uploaded_at,
    audioUrl: row.audio_url,
    coverUrl: row.cover_url,
    members: row.members,
  };
}
