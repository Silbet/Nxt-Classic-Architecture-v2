import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Mock fetchTracks and resolveMissingCovers
const mockFetchTracks = vi.fn();
const mockResolveMissingCovers = vi.fn((tracks) => Promise.resolve(tracks));
vi.mock('./lib/supabase', () => ({
  fetchTracks: (...args: unknown[]) => mockFetchTracks(...args),
  resolveMissingCovers: (tracks: unknown) => mockResolveMissingCovers(tracks),
}));

const sampleTracks = [
  {
    id: '1',
    title: 'Song A',
    artist: 'Artist A',
    album: 'Album A',
    duration: 200,
    recordedAt: '2024-01-01',
    uploadedAt: '2024-01-01T10:00:00Z',
    audioUrl: 'https://example.com/a.mp3',
    coverUrl: null,
    members: [{ name: 'Alice', part: 'Guitar' }],
  },
];

describe('App', () => {
  beforeEach(() => {
    mockFetchTracks.mockReset();
  });

  it('shows loading spinner while fetching tracks', () => {
    mockFetchTracks.mockReturnValue(new Promise(() => {})); // never resolves
    render(<App />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders FixedPlayer and TrackList after loading', async () => {
    mockFetchTracks.mockResolvedValue(sampleTracks);
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // TrackList renders the track
    expect(screen.getByText('Song A')).toBeInTheDocument();
    // FixedPlayer shows placeholder when no track selected
    expect(screen.getByText('곡을 선택해주세요')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    mockFetchTracks.mockRejectedValue(new Error('네트워크 오류'));
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('alert')).toHaveTextContent('네트워크 오류');
  });

  it('shows generic error for non-Error throws', async () => {
    mockFetchTracks.mockRejectedValue('unknown');
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      '트랙 목록을 불러올 수 없습니다.'
    );
  });

  it('renders empty track list message when no tracks', async () => {
    mockFetchTracks.mockResolvedValue([]);
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    expect(screen.getByText('등록된 곡이 없습니다')).toBeInTheDocument();
  });
});
