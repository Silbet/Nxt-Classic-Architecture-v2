import { describe, it, expect } from 'vitest';
import { initialState, playerReducer, shuffleArray } from './playerReducer';
import type { Track } from '../types';

function makeTrack(id: string, uploadedAt: string): Track {
  return {
    id,
    title: `Track ${id}`,
    artist: `Artist ${id}`,
    album: `Album ${id}`,
    duration: 180,
    recordedAt: '2024-01-01',
    uploadedAt,
    audioUrl: `https://example.com/${id}.mp3`,
    coverUrl: null,
    members: [{ name: 'Member', part: 'Guitar' }],
    playCount: 0,
  };
}

const tracks: Track[] = [
  makeTrack('1', '2024-01-01T00:00:00Z'),
  makeTrack('2', '2024-03-01T00:00:00Z'),
  makeTrack('3', '2024-02-01T00:00:00Z'),
];

describe('initialState', () => {
  it('has correct default values', () => {
    expect(initialState.autoplay).toBe(true);
    expect(initialState.sortOrder).toBe('desc');
    expect(initialState.currentIndex).toBe(-1);
    expect(initialState.isPlaying).toBe(false);
    expect(initialState.currentTime).toBe(0);
    expect(initialState.duration).toBe(0);
    expect(initialState.error).toBeNull();
  });
});

describe('playerReducer', () => {
  describe('LOAD_TRACKS', () => {
    it('stores tracks and creates desc-sorted queue', () => {
      const state = playerReducer(initialState, { type: 'LOAD_TRACKS', payload: tracks });
      expect(state.tracks).toEqual(tracks);
      expect(state.queue[0].id).toBe('2'); // newest first
      expect(state.queue[1].id).toBe('3');
      expect(state.queue[2].id).toBe('1');
    });
  });

  describe('SELECT_TRACK', () => {
    it('sets currentIndex and isPlaying=true', () => {
      const loaded = playerReducer(initialState, { type: 'LOAD_TRACKS', payload: tracks });
      const state = playerReducer(loaded, { type: 'SELECT_TRACK', payload: 1 });
      expect(state.currentIndex).toBe(1);
      expect(state.isPlaying).toBe(true);
      expect(state.currentTime).toBe(0);
    });
  });

  describe('PLAY / PAUSE', () => {
    it('PLAY sets isPlaying to true', () => {
      const state = playerReducer({ ...initialState, isPlaying: false }, { type: 'PLAY' });
      expect(state.isPlaying).toBe(true);
    });

    it('PAUSE sets isPlaying to false', () => {
      const state = playerReducer({ ...initialState, isPlaying: true }, { type: 'PAUSE' });
      expect(state.isPlaying).toBe(false);
    });
  });

  describe('NEXT / PREV', () => {
    it('NEXT increments currentIndex', () => {
      const loaded = playerReducer(initialState, { type: 'LOAD_TRACKS', payload: tracks });
      const selected = playerReducer(loaded, { type: 'SELECT_TRACK', payload: 0 });
      const state = playerReducer(selected, { type: 'NEXT' });
      expect(state.currentIndex).toBe(1);
    });

    it('NEXT wraps to 0 at end', () => {
      const loaded = playerReducer(initialState, { type: 'LOAD_TRACKS', payload: tracks });
      const selected = playerReducer(loaded, { type: 'SELECT_TRACK', payload: 2 });
      const state = playerReducer(selected, { type: 'NEXT' });
      expect(state.currentIndex).toBe(0);
    });

    it('PREV decrements currentIndex', () => {
      const loaded = playerReducer(initialState, { type: 'LOAD_TRACKS', payload: tracks });
      const selected = playerReducer(loaded, { type: 'SELECT_TRACK', payload: 2 });
      const state = playerReducer(selected, { type: 'PREV' });
      expect(state.currentIndex).toBe(1);
    });

    it('PREV wraps to last at beginning', () => {
      const loaded = playerReducer(initialState, { type: 'LOAD_TRACKS', payload: tracks });
      const selected = playerReducer(loaded, { type: 'SELECT_TRACK', payload: 0 });
      const state = playerReducer(selected, { type: 'PREV' });
      expect(state.currentIndex).toBe(2);
    });
  });

  describe('SEEK', () => {
    it('sets currentTime to payload', () => {
      const state = playerReducer(initialState, { type: 'SEEK', payload: 42.5 });
      expect(state.currentTime).toBe(42.5);
    });
  });

  describe('TOGGLE_SORT', () => {
    it('toggles between desc and asc', () => {
      const loaded = playerReducer(initialState, { type: 'LOAD_TRACKS', payload: tracks });
      const toggled = playerReducer(loaded, { type: 'TOGGLE_SORT' });
      expect(toggled.sortOrder).toBe('asc');
      expect(toggled.queue[0].id).toBe('1'); // oldest first

      const toggledBack = playerReducer(toggled, { type: 'TOGGLE_SORT' });
      expect(toggledBack.sortOrder).toBe('desc');
      expect(toggledBack.queue[0].id).toBe('2'); // newest first
    });
  });

  describe('SET_TIME / SET_DURATION / SET_ERROR', () => {
    it('SET_TIME updates currentTime', () => {
      const state = playerReducer(initialState, { type: 'SET_TIME', payload: 99 });
      expect(state.currentTime).toBe(99);
    });

    it('SET_DURATION updates duration', () => {
      const state = playerReducer(initialState, { type: 'SET_DURATION', payload: 300 });
      expect(state.duration).toBe(300);
    });

    it('SET_ERROR updates error', () => {
      const state = playerReducer(initialState, { type: 'SET_ERROR', payload: 'fail' });
      expect(state.error).toBe('fail');
      expect(state.isLoading).toBe(false);
    });
  });
});

describe('shuffleArray', () => {
  it('returns array with same elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffleArray(arr);
    expect(result).toHaveLength(arr.length);
    expect(result.sort()).toEqual(arr.sort());
  });

  it('does not mutate original array', () => {
    const arr = [1, 2, 3];
    const copy = [...arr];
    shuffleArray(arr);
    expect(arr).toEqual(copy);
  });

  it('returns empty array for empty input', () => {
    expect(shuffleArray([])).toEqual([]);
  });

  it('returns single element for single-element input', () => {
    expect(shuffleArray([42])).toEqual([42]);
  });
});
