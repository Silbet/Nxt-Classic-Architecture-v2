import { createClient } from '@supabase/supabase-js';
import { type Track, type SupabaseTrackRow, mapSupabaseTrack } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchTracks(): Promise<Track[]> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .order('recorded_at', { ascending: false })
    .order('uploaded_at', { ascending: false });

  if (error) {
    throw new Error(`트랙 목록 로드 실패: ${error.message}`);
  }

  return (data as SupabaseTrackRow[]).map(mapSupabaseTrack);
}


