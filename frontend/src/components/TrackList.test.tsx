import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TrackList from './TrackList';
import type { PlayerState } from '../types';

// Mock usePlayer
const mockDispatch = vi.fn();
let mockState: PlayerState;

vi.mock('../context/PlayerContext', () => ({
  usePlayer: () => ({ state: mockState, dispatch: mockDispatch }),
}));

const makeTracks = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    title: `Song ${i + 1}`,
    artist: `Artist ${i + 1}`,
    album: `Album ${i + 1}`,
    duration: 180 + i,
    recordedAt: `2024-01-${String(i + 1).padStart(2, '0')}`,
    uploadedAt: `2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
    audioUrl: `https://example.com/${i + 1}.mp3`,
    coverUrl: null,
    members: [{ name: 'Member', part: 'Guitar' }],
    playCount: 0,
  }));

describe('TrackList', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockState = {
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
  });

  it('shows loading spinner when isLoading', () => {
    mockState.isLoading = true;
    render(<TrackList />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error message when error exists', () => {
    mockState.error = '데이터를 불러올 수 없습니다';
    render(<TrackList />);
    expect(screen.getByRole('alert')).toHaveTextContent('데이터를 불러올 수 없습니다');
  });

  it('shows empty message when queue is empty', () => {
    render(<TrackList />);
    expect(screen.getByText('등록된 곡이 없습니다')).toBeInTheDocument();
  });

  it('renders track items from queue', () => {
    const tracks = makeTracks(3);
    mockState.queue = tracks;
    render(<TrackList />);
    expect(screen.getByText('Song 1')).toBeInTheDocument();
    expect(screen.getByText('Song 2')).toBeInTheDocument();
    expect(screen.getByText('Song 3')).toBeInTheDocument();
  });

  it('shows sort toggle button with current order', () => {
    mockState.queue = makeTracks(1);
    render(<TrackList />);
    expect(screen.getByText('최신순')).toBeInTheDocument();
  });

  it('dispatches TOGGLE_SORT on sort button click', () => {
    mockState.queue = makeTracks(1);
    render(<TrackList />);
    fireEvent.click(screen.getByText('최신순'));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'TOGGLE_SORT' });
  });

  it('shows 오래된순 when sortOrder is asc', () => {
    mockState.sortOrder = 'asc';
    mockState.queue = makeTracks(1);
    render(<TrackList />);
    expect(screen.getByText('오래된순')).toBeInTheDocument();
  });

  it('dispatches SELECT_TRACK when a track play button is clicked', () => {
    mockState.queue = makeTracks(2);
    render(<TrackList />);
    const playButtons = screen.getAllByRole('button', { name: /재생/ });
    fireEvent.click(playButtons[1]);
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'SELECT_TRACK', payload: 1 });
  });

  it('highlights the active track', () => {
    mockState.queue = makeTracks(2);
    mockState.currentIndex = 0;
    const { container } = render(<TrackList />);
    const items = container.querySelectorAll('li');
    expect(items[0]?.className).toContain('bg-bg-tertiary');
    expect(items[1]?.className).not.toContain('bg-bg-tertiary');
  });
});
