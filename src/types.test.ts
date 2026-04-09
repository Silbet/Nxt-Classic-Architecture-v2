import { describe, it, expect } from 'vitest';
import { mapSupabaseTrack, type SupabaseTrackRow, type Track } from './types';

describe('mapSupabaseTrack', () => {
  it('converts snake_case DB row to camelCase Track', () => {
    const row: SupabaseTrackRow = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: '봄날',
      artist: 'BTS',
      album: 'You Never Walk Alone',
      duration: 274,
      recorded_at: '2024-12-01',
      uploaded_at: '2024-12-15T10:30:00Z',
      audio_url: 'https://storage.supabase.co/audio/spring-day.mp3',
      cover_url: 'https://itunes.apple.com/cover/spring-day.jpg',
      members: [
        { name: '홍길동', part: '기타' },
        { name: '김철수', part: '드럼' },
      ],
      play_count: 0,
    };

    const track: Track = mapSupabaseTrack(row);

    expect(track.id).toBe(row.id);
    expect(track.title).toBe(row.title);
    expect(track.artist).toBe(row.artist);
    expect(track.album).toBe(row.album);
    expect(track.duration).toBe(row.duration);
    expect(track.recordedAt).toBe(row.recorded_at);
    expect(track.uploadedAt).toBe(row.uploaded_at);
    expect(track.audioUrl).toBe(row.audio_url);
    expect(track.coverUrl).toBe(row.cover_url);
    expect(track.members).toEqual(row.members);
  });

  it('handles null cover_url', () => {
    const row: SupabaseTrackRow = {
      id: 'abc',
      title: 'Test',
      artist: 'Artist',
      album: 'Album',
      duration: 180,
      recorded_at: '2024-01-01',
      uploaded_at: '2024-01-01T00:00:00Z',
      audio_url: 'https://example.com/audio.mp3',
      cover_url: null,
      members: [],
      play_count: 0,
    };

    const track = mapSupabaseTrack(row);

    expect(track.coverUrl).toBeNull();
  });
});
