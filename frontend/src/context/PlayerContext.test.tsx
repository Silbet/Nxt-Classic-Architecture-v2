import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { PlayerProvider, usePlayer } from './PlayerContext';
import type { Track } from '../types';

const sampleTrack: Track = {
  id: '1',
  title: 'Test Song',
  artist: 'Test Artist',
  album: 'Test Album',
  duration: 180,
  recordedAt: '2024-01-01',
  uploadedAt: '2024-01-01T00:00:00Z',
  audioUrl: 'https://example.com/test.mp3',
  coverUrl: null,
  members: [{ name: 'Alice', part: 'Guitar' }],
  playCount: 0,
};

const sampleTrack2: Track = {
  ...sampleTrack,
  id: '2',
  title: 'Test Song 2',
  uploadedAt: '2024-01-02T00:00:00Z',
  audioUrl: 'https://example.com/test2.mp3',
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <PlayerProvider>{children}</PlayerProvider>;
}

describe('PlayerContext', () => {
  it('usePlayer throws when used outside PlayerProvider', () => {
    expect(() => {
      renderHook(() => usePlayer());
    }).toThrow('usePlayer must be used within a PlayerProvider');
  });

  it('provides initial state', () => {
    const { result } = renderHook(() => usePlayer(), { wrapper });

    expect(result.current.state.isPlaying).toBe(false);
    expect(result.current.state.autoplay).toBe(true);
    expect(result.current.state.currentIndex).toBe(-1);
    expect(result.current.state.tracks).toEqual([]);
    expect(result.current.state.queue).toEqual([]);
  });

  it('dispatches LOAD_TRACKS and updates state', () => {
    const { result } = renderHook(() => usePlayer(), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'LOAD_TRACKS', payload: [sampleTrack, sampleTrack2] });
    });

    expect(result.current.state.tracks).toHaveLength(2);
    expect(result.current.state.queue).toHaveLength(2);
  });

  it('dispatches PLAY and PAUSE', () => {
    const { result } = renderHook(() => usePlayer(), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'PLAY' });
    });
    expect(result.current.state.isPlaying).toBe(true);

    act(() => {
      result.current.dispatch({ type: 'PAUSE' });
    });
    expect(result.current.state.isPlaying).toBe(false);
  });

  it('dispatches SET_ERROR', () => {
    const { result } = renderHook(() => usePlayer(), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'SET_ERROR', payload: 'Something went wrong' });
    });
    expect(result.current.state.error).toBe('Something went wrong');
  });

  it('dispatches SELECT_TRACK', () => {
    const { result } = renderHook(() => usePlayer(), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'LOAD_TRACKS', payload: [sampleTrack, sampleTrack2] });
    });

    act(() => {
      result.current.dispatch({ type: 'SELECT_TRACK', payload: 0 });
    });

    expect(result.current.state.currentIndex).toBe(0);
    expect(result.current.state.isPlaying).toBe(true);
  });

  it('exposes audioRef', () => {
    const { result } = renderHook(() => usePlayer(), { wrapper });
    expect(result.current.audioRef).toBeDefined();
  });
});
