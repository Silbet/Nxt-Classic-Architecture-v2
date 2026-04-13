import type { Track } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function fetchTracks(): Promise<Track[]> {
  const res = await fetch(`${API_URL}/api/tracks`);
  if (!res.ok) throw new Error(`트랙 목록 로드 실패: ${res.statusText}`);
  return res.json();
}

export async function incrementPlayCount(trackId: string): Promise<void> {
  await fetch(`${API_URL}/api/tracks/${trackId}/play`, { method: 'POST' });
}
